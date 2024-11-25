import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import { getUser, login } from './auth.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'
import { deleteCookie } from 'hono/cookie'
import fs from 'fs'
import { join } from 'path'

const app = new OpenAPIHono()



app.openapi(
  createRoute({
    method: 'get',
    path: '/profile/requests',
    description: 'Get all connection requests for current user',
    tags: ['Profile'],
    responses: {
      200: DefaultJsonArrayResponse("Getting all connection requests for current user successful", {
        from_id: z.number(),
        to_id: z.number(),
        created_at: z.string(),
        from: z.object({
          username: z.string(),
          work_history: z.string().nullable(),
          skills: z.string().nullable(),
          id: z.number(),
          created_at: z.string(),
          updated_at: z.string(),
          email: z.string(),
          password_hash: z.string(),
          full_name: z.string().nullable(),
          profile_photo_path: z.string(),
        })
      }
      ),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    // get all received_requests for user and the data of the user who sent the request
    const requests = await db.connectionRequest.findMany({
      where: {
        to_id: user.id
      },
      include: {
        from: true,
      }
    });

    return c.json({
        success: true,
        message: '',
        body: requests
    })
}
)


async function getConnectionCount(user_id: number) {
  // TODO: Optimize this either with denormalization or redis

  return await db.connection.count({
    where: {
      OR: [
        {
          from_id: user_id
        },
        {
          to_id: user_id
        }
      ]
    }
  })
}
app.openapi(
    createRoute({
      method: 'get',
      path: '/profile/:user_id',
      description: 'Get profile by user_id',
      tags: ['Profile'],
      request: {
        params: z.object({
          user_id: z.coerce.number()
        })
      },
      responses: {
        200: {
          description: "Getting profile by user_id successful",
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
                message: z.string(),
                body: z.object({ // Case public
                  username: z.string(),
                  name: z.string(),
                  work_history: z.string(),
                  skills: z.string(),
                  connection_count: z.number(),
                  profile_photo: z.string(),
                  relevant_posts: z.optional(z.array(z.object(PostSchema()))),
                  connection: z.enum(["connected", "not_connected", "owner", "public"]),
                  can_edit: z.boolean().optional()
                }).or(z.object({}))
              })
            }
          }
        },
        404: DefaultJsonResponse("User not found"),
      },
    }), async (c) => {
      const user = await getUser(c) as JwtContent;
      const { user_id } = c.req.valid("param");

      // case logged in & owner (do it early to avoid unnecessary db queries)
      if(user && user.id === user_id) {
        const connection_count = await getConnectionCount(user_id);
        const user = await db.user.findFirst({
          where: {
            id: user_id
          },
          include: {
            feeds: true,
          }
        });
        if(!user) { // happens when user is deleted but someone still has the token in their browser. Logout the user
          c.status(404);
          deleteCookie(c, "token");
          return c.json({
            success: false,
            message: 'User not found. Account might have been deleted',
            body: {}
          })
        }

        return c.json({
          success: true,
          message: '',
          body: {
            username: user.username,
            name: user.full_name,
            work_history: user.work_history,
            skills: user.skills,
            connection_count: connection_count,
            profile_photo: user.profile_photo_path,
            relevant_posts: user.feeds,
            connection: "owner",
            can_edit: true
          }
        })
      }

      if(!user) { // case public
        const targetUser = await db.user.findFirst({
          where: {
            id: user_id
          }
        })
        if(!targetUser) { // case target user not found
          c.status(404);
          return c.json({
            success: false,
            message: 'User not found',
            body: {}
          })
        }
        return c.json({
          success: true,
          message: '',
          body: {
            username: targetUser.username,
            name: targetUser.full_name,
            work_history: targetUser.work_history,
            skills: targetUser.skills,
            connection_count: await getConnectionCount(user_id),
            profile_photo: targetUser.profile_photo_path,
            connection: "public",
            can_edit: false
          }
        })
      } else { // case logged in & (connected/not connected)
        const connected = await db.connection.findFirst({
          where: {
            OR: [
              {
                from_id: user.id,
                to_id: user_id
              },
              {
                from_id: user_id,
                to_id: user.id
              }
            ]
          }
        })
        if(connected) {
          const targetUser = await db.user.findFirst({
            where: {
              id: user_id
            },
            include: {
              feeds: true,
            }
          })
          if(!targetUser) { // case target user not found
            c.status(404);
            return c.json({
              success: false,
              message: 'User not found',
              body: {}
            })
          }
          return c.json({
            success: true,
            message: '',
            body: {
              username: targetUser.username,
              name: targetUser.full_name,
              work_history: targetUser.work_history,
              skills: targetUser.skills,
              connection_count: await getConnectionCount(user_id),
              profile_photo: targetUser.profile_photo_path,
              relevant_posts: targetUser.feeds,
              connection: "connected",
              can_edit: false
            }
          })
        } else {
          const targetUser = await db.user.findFirst({
            where: {
              id: user_id
            }
          })
          if(!targetUser) { // case target user not found
            c.status(404);
            return c.json({
              success: false,
              message: 'User not found',
              body: {}
            })
          }
          return c.json({
            success: true,
            message: '',
            body: {
              username: targetUser.username,
              name: targetUser.full_name,
              work_history: targetUser.work_history,
              skills: targetUser.skills,
              connection_count: await getConnectionCount(user_id),
              profile_photo: targetUser.profile_photo_path,
              connection: "not_connected",
              can_edit: false
            }
          })
        }
      }
  }
)

function getProfilePhotoPathPrefixId(user_id: number, image_name: string) {
  return `/uploads/img/${user_id}_${image_name}`
}
function getProfilePhotoPath(image_name: string) {
  return `/uploads/img/${image_name}`
}

app.openapi(
    createRoute({
      method: 'put',
      path: '/profile/:user_id',
      description: 'Edit profile',
      tags: ['Profile'],
      request: {
        params: z.object({
          user_id: z.coerce.number()
        }),
        body: {
          required: true,
          description: "Edit profile",
          content: {
            "multipart/form-data": {
              schema: z.object({
                username: z.string(),
                profile_photo: z.instanceof(Buffer).or(z.any()),
                name: z.string(),
                work_history: z.string(),
                skills: z.string(),
              }),
            },
          },
        }
      },
      responses: {
        200: DefaultJsonResponse("Editing profile successful", {
          username: z.string(),
          profile_photo: z.instanceof(Buffer).or(z.any()),
          name: z.string(),
          work_history: z.string(),
          skills: z.string(),
        }),
        401: DefaultJsonResponse("Unauthorized"),
        400: DefaultJsonResponse("Invalid profile photo"),
        500: DefaultJsonResponse("Failed to edit profile")
      },
      middleware: authenticated
    }), async (c) => {
      const user = c.var.user;
      const targetId = c.req.valid("param").user_id;
      
      if(user.id !== targetId) {
        c.status(401);
        return c.json({
          success: false,
          message: 'Unauthorized',
        })
      }

      try {
        const {  username, name, work_history, skills } = c.req.valid("form");
        
        const { profile_photo } = await c.req.parseBody()
        if(profile_photo) {
          
          
          if(user.profile_photo_path !== "jobseeker_profile.svg") { // delete old profile photo
            const old_profile_photo_path = getProfilePhotoPath(user.profile_photo_path);
            fs.unlink(join(process.cwd(), old_profile_photo_path), (err) => {
              if (err) throw err
            })
          }
          
          const image = profile_photo as File;
          const buffer = await image.arrayBuffer()
          const profile_photo_path = getProfilePhotoPathPrefixId(user.id, image.name);
          fs.writeFile(profile_photo_path, Buffer.from(buffer), (err) => {
            if (err) throw err
          })

          const updatedUser = await db.user.update({
            where: {
              id: user.id
            },
            data: {
              username: username,
              profile_photo_path: profile_photo_path,
              full_name: name,
              work_history: work_history,
              skills: skills
            }
          });

          await login(c, Number(user.id), updatedUser.username, updatedUser.email, updatedUser.full_name, updatedUser.work_history, updatedUser.skills, updatedUser.profile_photo_path)
          return c.json({
            success: true,
            message: '',
            body: {
              username: updatedUser.username,
              profile_photo: updatedUser.profile_photo_path,
              name: updatedUser.full_name || "",
              work_history: updatedUser.work_history || "",
              skills: updatedUser.skills || "",
            }
          })
        } else {
          const updatedUser = await db.user.update({
            where: {
              id: user.id
            },
            data: {
              username: username,
              full_name: name,
              work_history: work_history,
              skills: skills
            }
          });

          await login(c, Number(user.id), updatedUser.username, updatedUser.email, updatedUser.full_name, updatedUser.work_history, updatedUser.skills, updatedUser.profile_photo_path)
          return c.json({
            success: true,
            message: '',
            body: {
              username: updatedUser.username,
              profile_photo: updatedUser.profile_photo_path,
              name: updatedUser.full_name || "",
              work_history: updatedUser.work_history || "",
              skills: updatedUser.skills || "",
            }
          })
        }

      } catch(e) {
        console.log(e)
        c.status(500);
        return c.json({
          success: false,
          message: "Failed",
        })
      }
  }
)


app.openapi(
  createRoute({
    method: 'post',
    path: '/profile/:user_id/connect',
    description: 'Connect request to another user',
    tags: ['Profile'],
    request: {
      params: z.object({
        user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonResponse("Connection request to another user successful"),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    db.connectionRequest.create({
      data: {
        from_id: user.id,
        to_id: Number.parseInt(c.req.param("user_id"))
      }
    });

    return c.json({
        success: true,
        message: '',
    })
}
)

app.openapi(
  createRoute({
    method: 'post',
    path: '/profile/:user_id/accept',
    description: 'Accept connection request from another user',
    tags: ['Profile'],
    request: {
      params: z.object({
        user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonResponse("Accept connection request from another user successful"),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;

    // check if connection request exists
    const connectionRequest = await db.connectionRequest.findFirst({
      where: {
        from_id: Number.parseInt(c.req.param("user_id")),
        to_id: user.id
      }
    });

    if(!connectionRequest) {
      c.status(401);
      return c.json({
        success: false,
        message: 'Connection request not found',
      })
    }

    db.connection.create({
      data: {
        from_id: Number.parseInt(c.req.param("user_id")),
        to_id: user.id,
      }
    });

    return c.json({
        success: true,
        message: '',
    })
}
)

app.openapi(
  createRoute({
    method: 'post',
    path: '/profile/:user_id/deny',
    description: 'Accept connection request from another user',
    tags: ['Profile'],
    request: {
      params: z.object({
        user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonResponse("Accept connection request from another user successful"),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;

    // check if connection request exists
    const connectionRequest = await db.connectionRequest.findFirst({
      where: {
        from_id: Number.parseInt(c.req.param("user_id")),
        to_id: user.id
      }
    });

    if(!connectionRequest) {
      c.status(401);
      return c.json({
        success: false,
        message: 'Connection request not found',
      })
    }

    db.connection.create({
      data: {
        from_id: Number.parseInt(c.req.param("user_id")),
        to_id: user.id,
      }
    });

    return c.json({
        success: true,
        message: '',
    })
}
)

export default app


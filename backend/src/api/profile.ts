import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema } from '../schema.js'
import { getUser } from './auth.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'
import { deleteCookie } from 'hono/cookie'

const app = new OpenAPIHono()

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
                }).or(z.object({ // Case logged in, connected, owner
                  username: z.string(),
                  name: z.string(),
                  work_history: z.string(),
                  skills: z.string(),
                  connection_count: z.number(),
                  profile_photo: z.string(),
                  relevant_posts: z.array(z.object(PostSchema()))
                })).or(z.object({}))
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
            relevant_posts: user.feeds
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
              relevant_posts: targetUser.feeds
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
            }
          })
        }
      }
  }
)

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
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), async (c) => {
      const user = c.var.user;

      try {
        const {  username, profile_photo, name, work_history, skills } = c.req.valid("form");

        const updatedUser = await db.user.update({
          where: {
            id: user.id
          },
          data: {
            username: username,
            profile_photo_path: profile_photo,
            full_name: name,
            work_history: work_history,
            skills: skills
          }
        });

        return c.json({
          success: true,
          message: '',
          body: {
            username: updatedUser.username,
            profile_photo: updatedUser.profile_photo_path,
            name: updatedUser.full_name,
            work_history: updatedUser.work_history,
            skills: updatedUser.skills,
          }
        })

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


// app.post("/", authenticated, c => {
//     return c.json({
//         success: true,
//         message: '',
//         body: {
//         }
//     })
// });
app.openapi(
  createRoute({
    method: 'get',
    path: '/profile/requests',
    description: 'Get all connection requests for current user',
    tags: ['Profile'],
    request: {
      params: z.object({
        user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonResponse("Getting all connection requests for current user successful", {
        requests: z.array(z.object({
          from_id: z.number(),
          to_id: z.number()
        }))
      }),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    const requests = await db.connectionRequest.findMany({
      where: {
        to_id: user.id
      }
    });

    return c.json({
        success: true,
        message: '',
        body: {
          requests: requests
        }
    })
}
)

export default app


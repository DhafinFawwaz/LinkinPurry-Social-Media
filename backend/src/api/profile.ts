import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse, UserSchema, DefaultJsonErrorResponse } from '../schema.js'
import { getUser, login } from './auth.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'
import { deleteCookie } from 'hono/cookie'
import fs from 'fs'
import { join } from 'path'
import { redis } from '../db/redis.js'
import { InvalidateChatCache, InvalidateChatCacheAllWithUser } from '../socket/chat.js'
import { invalidateFeedCache } from './feed.js'
import { fileTypeFromBuffer } from 'file-type'
import { bodyLimit } from 'hono/body-limit'

const app = new OpenAPIHono()

async function getConnectionCountCache(user_id: number) {
  try {
    const cached = await redis.get(`user_${user_id}_connection_count`)
    if(cached) return parseInt(cached);
  } catch(e) {console.log(e)}

  return null;
}

async function setConnectionCountCache(user_id: number, count: number) {
  try {await redis.set(`user_${user_id}_connection_count`, count)}
  catch(e) {console.log(e)}
}

async function invalidateConnectionCountCache(user_id: number) {
  console.log("\x1b[33m[redis] Invalidating Connection Count Cache\x1b[0m")

  try {await redis.del(`user_${user_id}_connection_count`)}
  catch(e) {console.log(e)}
}

app.openapi(
  createRoute({
    method: 'get',
    path: '/profile/requests',
    description: 'Get all connection requests for current user',
    tags: ['Profile'],
    responses: {
      200: DefaultJsonResponse("Getting all connection requests for current user successful", {
        requests: z.array(z.object({
          from_id: z.number(),
          to_id: z.number(),
          created_at: z.string(),
          from: z.object(UserSchema())
        })),
        pending: z.array(z.object({
          from_id: z.number(),
          to_id: z.number(),
          created_at: z.string(),
          to: z.object(UserSchema())
        }))
      }),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
  try {
    // console.log(user)
  
    const requests = await db.connectionRequest.findMany({
      where: {
        to_id: user.id
      },
      // include: {
      //   from: true,
      // }
      select: {
        from: {
          select: {
            id: true,
            full_name: true,
            profile_photo_path: true,
          }
        },
        created_at: true,
      }
    });
  
    const pending = await db.connectionRequest.findMany({
      where: {
        from_id: user.id
      },
      // include: {
      //   to: true,
      // }
      select: {
        to: {
          select: {
            id: true,
            full_name: true,
            profile_photo_path: true,
          }
        },
        created_at: true,
      }
    });
  
    return c.json({
        success: true,
        message: '',
        body: {
          requests: requests,
          pending: pending
        }
    })
  } catch(e) {
    console.log(e)
    c.status(500)
    return c.json({
      success: false,
      message: 'Failed to get connection requests',
      body: {}
    })
  }

}
)


app.openapi(
  createRoute({
    method: 'get',
    path: '/profile/network',
    description: 'Get all connection for current user',
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
  try {
    const connectionFromUser = await db.connection.findMany({
      where: {
        to_id: user.id
      },
      // include: {
      //   from: true,
      // }
      select: {
        from: {
          select: {
            id: true,
            full_name: true,
            profile_photo_path: true,
          }
        },
        created_at: true,
      }
    });

    return c.json({
        success: true,
        message: '',
        body: connectionFromUser
    })
  } catch(e) {
    c.status(500)
    return c.json({
      success: false,
      message: 'Failed to get connection requests',
      body: {}
    })
  }
}
)


async function getConnectionCount(user_id: number) {
  const cached = await getConnectionCountCache(user_id);
  if(cached) {
    console.log("\x1b[32m[redis] Getting connection count Cached\x1b[0m")
    return cached;
  }

  const count = await db.connection.count({
    where: {
      from_id: user_id
    }
  })

  setConnectionCountCache(user_id, count);
  
  return count;
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
                  profile_photo_path: z.string(),
                  relevant_posts: z.optional(z.array(z.object(PostSchema()))),
                  connection: z.enum(["public", "owner", "not_connected", "connection_requested", "connection_received", "connected"]),
                }).or(z.object({}))
              })
            }
          }
        },
        401: DefaultJsonResponse("Unauthorized"),
        400: DefaultJsonResponse("Bad request"),
        404: DefaultJsonResponse("User not found"),
      },
    }), async (c) => {
      const user = await getUser(c) as JwtContent;
      const { user_id } = c.req.valid("param");
      
      if(!user) { // public
        const result: any[] = await db.$queryRaw`
WITH target_user AS (
  SELECT
    id,
    username,
    full_name,
    work_history,
    skills,
    profile_photo_path--,
    -- (
    --   SELECT COUNT(*)
    --   FROM connection
    --   WHERE from_id = users.id OR to_id = users.id
    -- ) as connection_count
  FROM users
  WHERE id = ${user_id}
)
SELECT
  tu.*,
  'public' as connection
FROM target_user tu
        `;
        if (result.length === 0) {
          c.status(404);
          return c.json({
            success: false,
            message: 'User not found',
            body: {}
          });
        }

        const userProfile = result[0];

        return c.json({
          success: true,
          message: '',
          body: {
            username: userProfile.username,
            name: userProfile.full_name,
            work_history: userProfile.work_history,
            skills: userProfile.skills,
            connection_count: await getConnectionCount(user_id),
            // connection_count: userProfile.connection_count,
            profile_photo_path: userProfile.profile_photo_path,
            connection: userProfile.connection,
          }
        });
      }      

      if(user.id === user_id) { // owner
        const result: any[] = await db.$queryRaw`
WITH target_user AS (
  SELECT
    id,
    username,
    full_name,
    work_history,
    skills,
    profile_photo_path,
    -- (
    --   SELECT COUNT(*)
    --   FROM connection
    --   WHERE from_id = users.id OR to_id = users.id
    -- ) as connection_count,
    (
      SELECT json_agg(feed.*)
      FROM feed
      WHERE feed.user_id = users.id
    ) as relevant_posts
  FROM users
  WHERE id = ${user_id}
)
SELECT
  tu.*,
  'owner' as connection
FROM target_user tu
        `;
        if (result.length === 0) {
          c.status(404);
          return c.json({
            success: false,
            message: 'User not found',
            body: {}
          });
        }

        const userProfile = result[0];

        return c.json({
          success: true,
          message: '',
          body: {
            username: userProfile.username,
            name: userProfile.full_name,
            work_history: userProfile.work_history,
            skills: userProfile.skills,
            // connection_count: userProfile.connection_count,
            connection_count: await getConnectionCount(user_id),
            profile_photo_path: userProfile.profile_photo_path,
            relevant_posts: userProfile.relevant_posts,
            connection: userProfile.connection,
          }
        });

      }

      try {
        const result: any[] = await db.$queryRaw`
WITH target_user AS (
  SELECT 
    id, 
    username, 
    full_name, 
    work_history, 
    skills, 
    profile_photo_path,
    -- (
    --   SELECT COUNT(*) 
    --   FROM connection
    --   WHERE from_id = users.id OR to_id = users.id
    -- ) as connection_count,
    (
      SELECT json_agg(feed.*)
      FROM feed
      WHERE feed.user_id = users.id
    ) as relevant_posts
  FROM users
  WHERE id = ${user_id}
),
connection_status AS (
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM connection 
        WHERE (from_id = ${user.id} AND to_id = ${user_id}) OR (from_id = ${user_id} AND to_id = ${user.id})
      ) THEN 'connected'
      WHEN EXISTS (
        SELECT 1 
        FROM connection_request
        WHERE from_id = ${user.id} AND to_id = ${user_id}
      ) THEN 'connection_requested'
      WHEN EXISTS (
        SELECT 1 
        FROM connection_request
        WHERE from_id = ${user_id} AND to_id = ${user.id}
      ) THEN 'connection_received'
      ELSE 'not_connected'
    END as status
)
SELECT 
  tu.*,
  cs.status as connection
FROM target_user tu, connection_status cs
      `;

        if (result.length === 0) {
          c.status(404);
          return c.json({
            success: false,
            message: 'User not found',
            body: {}
          });
        }

        const userProfile = result[0];

        return c.json({
          success: true,
          message: '',
          body: {
            username: userProfile.username,
            name: userProfile.full_name,
            work_history: userProfile.work_history,
            skills: userProfile.skills,
            // connection_count: userProfile.connection_count,
            connection_count: await getConnectionCount(user_id),
            profile_photo_path: userProfile.profile_photo_path,
            relevant_posts: userProfile.relevant_posts,
            connection: userProfile.connection,
          }
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        c.status(500);
        return c.json({
          success: false,
          message: 'Internal server error',
          body: {}
        });
      }

      // // case logged in & owner (do it early to avoid unnecessary db queries)
      // if(user && user.id === user_id) {
      //   // console.log(connection_count)
      //   const user = await db.user.findUnique({
      //     where: {
      //       id: user_id
      //     },
      //     include: {
      //       feeds: true,
      //     }
      //   });
      //   if(!user) { // happens when user is deleted but someone still has the token in their browser. Logout the user
      //     c.status(400);
      //     deleteCookie(c, "token");
      //     return c.json({
      //       success: false,
      //       message: 'User not found. Account might have been deleted',
      //       body: {}
      //     })
      //   }
      //   const connection_count = await getConnectionCount(user_id);

      //   return c.json({
      //     success: true,
      //     message: '',
      //     body: {
      //       username: user.username,
      //       name: user.full_name,
      //       work_history: user.work_history,
      //       skills: user.skills,
      //       connection_count: connection_count,
      //       profile_photo_path: user.profile_photo_path,
      //       relevant_posts: user.feeds,
      //       connection: "owner",
      //     }
      //   })
      // }

      // if(!user) { // case public
      //   const targetUser = await db.user.findUnique({
      //     where: {
      //       id: user_id
      //     }
      //   })
      //   if(!targetUser) { // case target user not found
      //     c.status(404);
      //     return c.json({
      //       success: false,
      //       message: 'User not found',
      //       body: {}
      //     })
      //   }
      //   return c.json({
      //     success: true,
      //     message: '',
      //     body: {
      //       username: targetUser.username,
      //       name: targetUser.full_name,
      //       work_history: targetUser.work_history,
      //       skills: targetUser.skills,
      //       connection_count: await getConnectionCount(user_id),
      //       profile_photo_path: targetUser.profile_photo_path,
      //       connection: "public",
      //     }
      //   })
      // } else { // case logged in & (not_connected/connection_requested/connection_received/connected)
      //   const connected = await db.connection.findUnique({
      //     where: {
      //       from_id_to_id: {
      //         from_id: user.id,
      //         to_id: user_id
      //       }
      //     }
      //   })
      //   if(connected) {
      //     const targetUser = await db.user.findUnique({
      //       where: {
      //         id: user_id
      //       },
      //       include: {
      //         feeds: true,
      //       }
      //     })
      //     if(!targetUser) { // case target user not found
      //       c.status(404);
      //       return c.json({
      //         success: false,
      //         message: 'User not found',
      //         body: {}
      //       })
      //     }
      //     return c.json({
      //       success: true,
      //       message: '',
      //       body: {
      //         username: targetUser.username,
      //         name: targetUser.full_name,
      //         work_history: targetUser.work_history,
      //         skills: targetUser.skills,
      //         connection_count: await getConnectionCount(user_id),
      //         profile_photo_path: targetUser.profile_photo_path,
      //         relevant_posts: targetUser.feeds,
      //         connection: "connected",
      //       }
      //     })
      //   } else { // case not_connected/connection_requested
      //     let connection = "not_connected"
      //     const connectionRequestMeToTarget = await db.connectionRequest.findUnique({
      //       where: {
      //         from_id_to_id: {
      //           from_id: user.id,
      //           to_id: user_id
      //         }
      //       }
      //     })
      //     if(connectionRequestMeToTarget) {
      //       connection = "connection_requested"
      //     } else {
      //       const connectionRequestTargetToMe = await db.connectionRequest.findUnique({
      //         where: {
      //           from_id_to_id: {
      //             from_id: user_id,
      //             to_id: user.id
      //           }
      //         }
      //       })
      //       if(connectionRequestTargetToMe) {
      //         connection = "connection_received"
      //       }
      //     }

      //     const targetUser = await db.user.findUnique({
      //       where: {
      //         id: user_id
      //       },
      //       include: {
      //         feeds: true,
      //       }
      //     })
      //     if(!targetUser) { // case target user not found
      //       c.status(404);
      //       return c.json({
      //         success: false,
      //         message: 'User not found',
      //         body: {}
      //       })
      //     }
      //     return c.json({
      //       success: true,
      //       message: '',
      //       body: {
      //         username: targetUser.username,
      //         name: targetUser.full_name,
      //         work_history: targetUser.work_history,
      //         skills: targetUser.skills,
      //         connection_count: await getConnectionCount(user_id),
      //         profile_photo_path: targetUser.profile_photo_path,
      //         relevant_posts: targetUser.feeds,
      //         connection: connection,
      //       }
      //     })
      //   }
      // }
  }
)


const baseImgPath = "/uploads/img/"
function getProfilePhotoPathPrefixId(user_id: number, image_name: string) {
  return `${baseImgPath}${user_id}_${image_name}`
}

const defaultPhotoPath = baseImgPath + "jobseeker_profile.svg"

async function isImage(buffer: Buffer) {
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType) return false;
  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return imageMimeTypes.includes(fileType.mime);
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
          profile_photo_path: z.string(),
          name: z.string(),
          work_history: z.string(),
          skills: z.string(),
        }),
        401: DefaultJsonResponse("Unauthorized"),
        400: DefaultJsonResponse("Invalid profile photo"),
        422: DefaultJsonErrorResponse("Username is taken", {
          username: z.string()
        }),
        423: DefaultJsonErrorResponse("Invalid image", {
          profile_photo: z.string()
        }),
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
          message: 'Cannot edit other user\'s profile',
        })
      }

      try {
        const { username, name, work_history, skills } = c.req.valid("form");
        // check if username is taken
        const existingUser = await db.user.findUnique({
          where: {
            username: username
          }
        })
        if(existingUser && Number(existingUser.id) !== user.id) {
          c.status(422);
          return c.json({
            success: false,
            message: 'Username is taken',
            errors: {
              username: "Username is taken"
            }
          })
        }
        
        const { profile_photo } = await c.req.parseBody()
        
        if(profile_photo) {

          const image = profile_photo as File
          const buffer = await image.arrayBuffer()
          if(!await isImage(Buffer.from(buffer))) {
            c.status(400);
            return c.json({
              success: false,
              message: 'Invalid profile photo',
              errors: {
                profile_photo: "Invalid image"
              }
            })
          }
          const profile_photo_path = getProfilePhotoPathPrefixId(user.id, image.name);
          if(profile_photo_path === "jobseeker_profile.svg") {
            c.status(400);
            return c.json({
              success: false,
              message: 'Invalid profile photo', // hehe
            })
          }
          
          if(user.profile_photo_path !== defaultPhotoPath) { // delete old profile photo
            fs.unlink(join(process.cwd(), user.profile_photo_path), (err) => {
              if (err) console.log(err)
            })
          }
          
          fs.writeFile(join(process.cwd(), profile_photo_path), Buffer.from(buffer), (err) => {
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
          await invalidateFeedCache()
          await InvalidateChatCacheAllWithUser(user.id)
          
          return c.json({
            success: true,
            message: '',
            body: {
              username: updatedUser.username,
              profile_photo_path: updatedUser.profile_photo_path,
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
          await invalidateFeedCache()
          await InvalidateChatCacheAllWithUser(user.id)
          
          return c.json({
            success: true,
            message: '',
            body: {
              username: updatedUser.username,
              profile_photo_path: updatedUser.profile_photo_path,
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
      400: DefaultJsonResponse("Bad request"),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    const target_id = Number.parseInt(c.req.param("user_id"));
    if(user.id === target_id) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Cannot connect to yourself',
      })
    }

    // check if connection already exists
    const connection2Way = await db.connection.findUnique({
      where: {
        from_id_to_id: {
          from_id: user.id,
          to_id: target_id
        }
      }
    });
    if(connection2Way) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Connection already exists',
      })
    }

    // Check if connection request already exists
    const connectionRequest2Way = await db.connectionRequest.findFirst({
      where: {
        OR: [
          {
            from_id: user.id,
            to_id: target_id
          },
          {
            from_id: target_id,
            to_id: user.id
          }
        ]
      }
    });
    if(connectionRequest2Way) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Connection request already exists',
      })
    }

    // create connection request
    await db.connectionRequest.create({
      data: {
        from_id: user.id,
        to_id: target_id
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
      400: DefaultJsonResponse("Failed to accept connection request"),
      401: DefaultJsonResponse("Unauthorized"),
      404: DefaultJsonResponse("Failed to find connection request")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    const target_id = Number.parseInt(c.req.param("user_id"));
    if(user.id === target_id) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Cannot accept yourself',
      })
    }

    // check if connection exists
    const connection2Way = await db.connection.findUnique({
      where: {
        from_id_to_id: {
          from_id: user.id,
          to_id: target_id
        }
      }
    });
    if(connection2Way) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Connection already exists',
      })
    }

    // check if connection request me to target exists
    const connectionRequestMeToTarget = await db.connectionRequest.findUnique({
      where: {
        from_id_to_id: {
          from_id: user.id,
          to_id: target_id
        }
      }
    });
    if(connectionRequestMeToTarget) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Current user is accepting but the current user is the one who sent the request',
      })
    }

    // check if connection request target to me exists
    const connectionRequestTargetToMe = await db.connectionRequest.findUnique({
      where: {
        from_id_to_id: {
          from_id: target_id,
          to_id: user.id
        }
      }
    });

    if(!connectionRequestTargetToMe) {
      c.status(404);
      return c.json({
        success: false,
        message: 'Connection request not found',
      })
    }


    await db.$transaction(async (db) => {
      await db.connectionRequest.delete({
        where: {
          from_id_to_id: {
            from_id: target_id,
            to_id: user.id
          }
        }
      });
  
      await db.connection.create({
        data: {
          from_id: target_id,
          to_id: user.id,
        }
      });

      await db.connection.create({
        data: {
          from_id: user.id,
          to_id: target_id,
        }
      });
    })
    invalidateConnectionCountCache(user.id)
    invalidateConnectionCountCache(target_id)
    InvalidateChatCache(user.id, target_id)

    return c.json({
        success: true,
        message: '',
    })
}
)

app.openapi(
  createRoute({
    method: 'delete',
    path: '/profile/:user_id/deny',
    description: 'Deny connection request from another user',
    tags: ['Profile'],
    request: {
      params: z.object({
        user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonResponse("Deny connection request from another user successful"),
      400: DefaultJsonResponse("Failed to deny connection request"),
      401: DefaultJsonResponse("Unauthorized"),
      404: DefaultJsonResponse("Failed to find connection request")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    const target_id = Number.parseInt(c.req.param("user_id"));
    if(user.id === target_id) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Cannot deny yourself',
      })
    }

    // check if connection exists
    const connection2Way = await db.connection.findUnique({
      where: {
        from_id_to_id: {
          from_id: user.id,
          to_id: target_id
        }
      }
    })
    if(connection2Way) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Connection already exists',
      })
    }

    // check if connection request me to target exists
    const connectionRequestMeToTarget = await db.connectionRequest.findUnique({
      where: {
        from_id_to_id: {
          from_id: user.id,
          to_id: target_id
        }
      }
    });
    if(connectionRequestMeToTarget) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Current user is denying but the current user is the one who sent the request',
      })
    }

    // check if connection request target to me exists
    const connectionRequestTargetToMe = await db.connectionRequest.findUnique({
      where: {
        from_id_to_id: {
          from_id: target_id,
          to_id: user.id
        }
      }
    });
    if(!connectionRequestTargetToMe) {
      c.status(404);
      return c.json({
        success: false,
        message: 'Connection request not found',
      })
    }

    await db.connectionRequest.delete({
      where: {
        from_id_to_id: {
          from_id: target_id,
          to_id: user.id
        }
      }
    })

    return c.json({
        success: true,
        message: '',
    })
}
)


app.openapi(
  createRoute({
    method: 'delete',
    path: '/profile/:user_id/disconnect',
    description: 'Disconnect another user',
    tags: ['Profile'],
    request: {
      params: z.object({
        user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonResponse("Disconnecting another user successful"),
      400: DefaultJsonResponse("Failed to disconnect"),
      401: DefaultJsonResponse("Unauthorized"),
      404: DefaultJsonResponse("Failed to find connection")
    },
    middleware: authenticated
  }), async (c) => {
    const user = c.var.user;
    const target_id = Number.parseInt(c.req.param("user_id"));
    if(user.id === target_id) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Cannot disconnect yourself',
      })
    }

    // check if connection request exists
    const connectionRequest2Way = await db.connectionRequest.findFirst({
      where: {
        OR: [
          {
            from_id: user.id,
            to_id: target_id
          },
          {
            from_id: target_id,
            to_id: user.id
          }
        ]
      }
    })
    if(connectionRequest2Way) {
      c.status(400);
      return c.json({
        success: false,
        message: 'Connection request exists somehow',
      })
    }

    // check if connection exists
    const connection2Way = await db.connection.findFirst({
      where: {
        OR: [
          {
            from_id: user.id,
            to_id: target_id
          },
          {
            from_id: target_id,
            to_id: user.id
          }
        ]
      }
    })
    if(!connection2Way) {
      c.status(404);
      return c.json({
        success: false,
        message: 'Connection not found',
      })
    }

    await db.$transaction(async (db) => {
      try {
        await db.connection.delete({
          where: {
            from_id_to_id: {
              from_id: user.id,
              to_id: target_id
            }
          }
        })
      } catch(e) {}
      try {
        await db.connection.delete({
          where: {
            from_id_to_id: {
              from_id: target_id,
              to_id: user.id
            }
          }
        })
      } catch(e) {}
    })

    // delete all chat messages between the two users
    await db.chat.deleteMany({
      where: {
        OR: [
          {
            from_id: user.id,
            to_id: target_id
          },
          {
            from_id: target_id,
            to_id: user.id
          }
        ]
      }
    })


    invalidateConnectionCountCache(user.id)
    invalidateConnectionCountCache(target_id)

    return c.json({
        success: true,
        message: '',
    })
}
)



export default app


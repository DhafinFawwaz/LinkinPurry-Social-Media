import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema } from '../schema.js'
import { getUser } from './auth.js'
import db from '../db/db.js'
import { authenticated } from '../middlewares/authenticated.js'

const app = new OpenAPIHono()

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
        200: DefaultJsonResponse("Getting profile by user_id successful", {
            posts: z.array(z.object({
                name: z.string(),
                description: z.string(),
                profile_photo: z.string(),
                relevant_posts: z.array(z.object(PostSchema()))
            }))
        }),
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), (c) => {
      const user = c.var.user;

      return c.json({
          success: true,
          message: '',
          body: user
      })
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
                  name: z.string(),
                  description: z.string(),
                  profile_photo: z.instanceof(Buffer).or(z.any())
                }),
            },
          },
        }
      },
      responses: {
        200: DefaultJsonResponse("Editing profile successful", {
          name: z.string(),
          description: z.string(),
          profile_photo: z.string()
        }),
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), async (c) => {
      const user = c.var.user;

      try {
        const { name, description, profile_photo } = c.req.valid("form");
        if(!name || !description || !profile_photo) {
          c.status(422);
          return c.json({
            success: false,
            message: 'Name, description, and profile_photo are required',
          })
        }

        // await db.user.update({
        //   where: {
        //     id: user.id
        //   },
        //   data: {
        //     // name: name,
        //     // description: description,
        //     // profile_photo: profile_photo
        //   }
        // })

      } catch(e) {
      }


      return c.json({
          success: true,
          message: '',
          body: user
      })

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


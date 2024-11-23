import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema } from '../schema.js'

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
      }
    }), (c) => {

    // c.req.valid()

    return c.json({
        success: true,
        message: '',
        body: {
        }
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
      }
    }), (c) => {

    return c.json({
        success: true,
        message: '',
        body: {
        }
    })
  }
)

export default app


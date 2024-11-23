import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema } from '../schema.js'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'get',
      path: '/feed',
      description: 'Get a list of posts',
      tags: ['Feed'],
      request: {
        query: z.object({
            limit: z.coerce.number().optional(),
            cursor: z.coerce.number().optional()
        })
      },
      responses: {
        200: DefaultJsonResponse("Getting list of posts successful", {
            posts: z.array(z.object(PostSchema()))
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
      method: 'post',
      path: '/feed',
      description: 'Create a post',
      tags: ['Feed'],
      request: DefaultJsonRequest("Create a post", { 
        content: z.string() 
      }),
      responses: {
        200: DefaultJsonResponse("Creating a post successful", PostSchema()),
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


app.openapi(
    createRoute({
      method: 'put',
      path: '/feed/:post_id',
      description: 'Update a post by post_id',
      tags: ['Feed'],
      request: {
        params: z.object({
            post_id: z.coerce.number()
        }),
        body: {
            required: true,
            description: "Update a post by post_id",
            content: {
              'application/json': {
                schema: z.object(PostSchema())
              }
            },
        }
      },
      responses: {
        200: DefaultJsonResponse("Updating a post successful", PostSchema()),
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

app.openapi(
    createRoute({
      method: 'delete',
      path: '/feed/:post_id',
      description: 'Delete a post by post_id',
      tags: ['Feed'],
      request: {
        params: z.object({
            post_id: z.coerce.number()
        })
      },
      responses: {
        200: DefaultJsonResponse("Deleting a post successful", PostSchema()),
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

export default app


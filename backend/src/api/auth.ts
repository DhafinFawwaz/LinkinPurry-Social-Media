import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'post',
      path: '/login',
      responses: {
        200: {
          description: 'Login to an account',
          content: {
            'application/json': {
              schema: z.object({
                success: z.string(),
                message: z.string(),
                body: z.object({
                    token: z.string()
                })
              })
            }
          }
        }
      }
    }),
    (c) => {
        return c.json({
            success: 'true',
            message: 'Login success',
            body: {
                token: '',
            }
        })
    }
  )

export default app


import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonRequest, DefaultJsonResponse } from '../schema.js'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'get',
      path: '/health',
      description: 'Check database connection',
      tags: ['Database'],
      responses: {
        200: DefaultJsonResponse("Checking database connection successful"),
        422: DefaultJsonResponse("Email is taken")
      },
  
    }), (c) => {
        return c.json({
            success: true,
            message: 'Database connection is healthy'
        })
    }    
)    

export default app
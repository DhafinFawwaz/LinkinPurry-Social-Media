import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonRequest, DefaultJsonResponse } from '../schema.js'
import db from '../db/db.js'

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
  
    }), async (c) => {
      try {
        await db.$queryRaw`SELECT 1`;
        return c.json({
            success: true,
            message: 'Database connection is healthy'
        })
      } catch (error) {
        return c.json({
            success: false,
            message: 'Database connection is unhealthy'
        })
      }
    }    
)    

export default app
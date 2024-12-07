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
        500: DefaultJsonResponse("Database is not healthy yet")
      },
  
    }), async (c) => {
      try {
        await db.$queryRaw`SELECT 1`;
        return c.json({
            success: true,
            message: 'Database connection is healthy'
        })
      } catch (error) {
        c.status(500)
        return c.json({
            success: false,
            message: 'Database connection to ' + process.env.DATABASE_URL + ' is not healthy'
        })
      }
    }    
)    

export default app
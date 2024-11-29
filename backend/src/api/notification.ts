import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'
import webpush from '../notification/webpush.js'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'post',
      path: '/notification',
      description: 'Subscribe to notifications',
      tags: ['Profile'],
      request: DefaultJsonRequest("The user id to subscribe to", {
        subscription: z.string()
      }),
      responses: {
        200: DefaultJsonResponse("Subscribing to notificattion successful"),
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), async (c) => {
    const user = c.var.user;
    try {
        const { subscription } = c.req.valid("json");
        console.log(subscription)
        await db.pushSubscription.create({
            data: {
                user_id: user.id,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            }
        })
        return c.json({
            success: true,
            message: "Subscribed to notifications"
        })
      
    } catch (error) {
        return c.json({
            success: false,
            message: "Invalid request"
        })
    }
  }
)

app.openapi(
  createRoute({
    method: 'delete',
    path: '/notification',
    description: 'Unsubscribe to notifications',
    tags: ['Profile'],
    responses: {
      200: DefaultJsonResponse("Unsubscribing to notificattion successful"),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
  const user = c.var.user;
  try {
      await db.pushSubscription.deleteMany({
        where: {
          user_id: user.id
        }
      })
      return c.json({
          success: true,
          message: "Unsubscribed to notifications"
      })
    
  } catch (error) {
      return c.json({
          success: false,
          message: "Invalid request"
      })
  }
}
)


  
export default app


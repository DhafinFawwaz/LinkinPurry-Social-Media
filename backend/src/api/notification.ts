import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'post',
      path: '/notification/subscribe',
      description: 'Subscribe to notifications',
      tags: ['Notification'],
      request: DefaultJsonRequest("The user id to subscribe to", {
        subscription: z.object({
          endpoint: z.string(),
          keys: z.object({
            p256dh: z.string(),
            auth: z.string()
          })
        })
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
        // create a new subscription or update the existing one
        await db.pushSubscription.upsert({
          where: {
            user_id: user.id,
            endpoint: subscription.endpoint
          },
          create: {
            user_id: user.id,
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          update: {
            keys: subscription.keys
          }
        })

        console.log(`${user.id} subscribed to notifications`)
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
    method: 'post',
    path: '/notification/unsubscribe',
    description: 'Unsubscribe to notifications',
    tags: ['Notification'],
    request: DefaultJsonRequest("Endpoint to unsubscribe to", {
      endpoint: z.string()
    }),
    responses: {
      200: DefaultJsonResponse("Unsubscribing to notificattion successful"),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
  const user = c.var.user;
  try {
      const { endpoint } = c.req.valid("json");
      await db.pushSubscription.delete({
        where: {
          user_id: user.id,
          endpoint: endpoint
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


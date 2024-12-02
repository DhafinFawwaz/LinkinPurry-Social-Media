import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse, UserSchema } from '../schema.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'

const app = new OpenAPIHono()


app.openapi(
  createRoute({
    method: 'get',
    path: '/chats',
    description: 'Get all available chats but only the last message of each chat',
    tags: ['Chat'],
    responses: {
      200: DefaultJsonArrayResponse("Getting all available chats successful", {
        id: z.number().or(z.bigint()),
        timestamp: z.date(),
        from_id: z.number().or(z.bigint()),
        to_id: z.number().or(z.bigint()),
        message: z.string(),
        from: z.object(UserSchema()),
        to: z.object(UserSchema()),
      }),
      401: DefaultJsonResponse("Unauthorized"),
    },
    middleware: authenticated
  }), async (c) => {
    const userId = c.get('user').id;

    const chats = await db.$queryRaw`
SELECT 
    c.id,
    c.timestamp,
    c.message,
    CASE 
        WHEN c.from_id = ${userId} THEN c.to_id
        ELSE c.from_id
    END AS other_user_id,
    u.id AS user_id,
    u.full_name AS full_name,
    u.profile_photo_path AS profile_photo_path
FROM chat c
JOIN (
    SELECT 
        MAX(timestamp) AS latest_timestamp,
        CASE 
            WHEN from_id = ${userId} THEN to_id
            ELSE from_id
        END AS other_user_id
    FROM chat
    WHERE from_id = ${userId} OR to_id = ${userId}
    GROUP BY other_user_id
) latest_chats 
ON c.timestamp = latest_chats.latest_timestamp
AND (
    (c.from_id = ${userId} AND c.to_id = latest_chats.other_user_id) OR
    (c.to_id = ${userId} AND c.from_id = latest_chats.other_user_id)
)
JOIN users u ON u.id = latest_chats.other_user_id;
`;
    return c.json({
      success: true,
      message: '',
      body: chats
    })
}
)





app.openapi(
  createRoute({
    method: 'get',
    path: '/chats/never-chatted',
    description: 'Get all user that the current user has never chatted with',
    tags: ['Chat'],
    responses: {
      200: DefaultJsonArrayResponse("Getting all user that the current user has never chatted with successful", UserSchema()),
      401: DefaultJsonResponse("Unauthorized"),
    },
    middleware: authenticated
  }), async (c) => {
  const userId = c.get('user').id;

  const users = await db.user.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              connections_received: {
                some: {
                  to_id: userId,
                }
              },
              connections_sent: {
                some: {
                  from_id: userId,
                }
              }
            }
          ]
        },
        {
          NOT: {
            AND: [
              {
                sent_chats: {
                  some: {
                    from_id: userId,
                  }
                },
                received_chats: {
                  some: {
                    to_id: userId,
                  }
                }
              }
            ]
          }
        }
      ]
    }
  })


  return c.json({
  success: true,
  message: '',
  body: users
  })
}
)




app.openapi(
  createRoute({
    method: 'get',
    path: '/chats/:target_user_id',
    description: 'Get all available chats but only the last message of each chat, but also include user with id user_id',
    tags: ['Chat'],
    request: {
      params: z.object({
        target_user_id: z.coerce.number()
      })
    },
    responses: {
      200: DefaultJsonArrayResponse("Getting all available chats successful", {
        id: z.number().or(z.bigint()),
        timestamp: z.date(),
        from_id: z.number().or(z.bigint()),
        to_id: z.number().or(z.bigint()),
        message: z.string(),
        from: z.object(UserSchema()),
        to: z.object(UserSchema()),
      }),
      401: DefaultJsonResponse("Unauthorized"),
    },
    middleware: authenticated
  }), async (c) => {
    const userId = c.get('user').id;
    const { target_user_id } = c.req.valid("param");

    if(userId === target_user_id) {
      c.status(400)
      return c.json({
        success: false,
        message: 'You cannot chat with yourself',
      })
    }
    
    const trargetUser = await db.user.findUnique({
      where: {
        id: target_user_id
      }
    })
    if(!trargetUser) {
      c.status(404)
      return c.json({
        success: false,
        message: 'User not found',
        body: null
      })
    }

    const chats: any[] = await db.$queryRaw`
SELECT 
    c.id,
    c.timestamp,
    c.message,
    CASE 
        WHEN c.from_id = ${userId} THEN c.to_id
        ELSE c.from_id
    END AS other_user_id,
    u.id AS user_id,
    u.full_name AS full_name,
    u.profile_photo_path AS profile_photo_path
FROM chat c
JOIN (
    SELECT 
        MAX(timestamp) AS latest_timestamp,
        CASE 
            WHEN from_id = ${userId} THEN to_id
            ELSE from_id
        END AS other_user_id
    FROM chat
    WHERE from_id = ${userId} OR to_id = ${userId}
    GROUP BY other_user_id
) latest_chats 
ON c.timestamp = latest_chats.latest_timestamp
AND (
    (c.from_id = ${userId} AND c.to_id = latest_chats.other_user_id) OR
    (c.to_id = ${userId} AND c.from_id = latest_chats.other_user_id)
)
JOIN users u ON u.id = latest_chats.other_user_id;
`;

    if(chats.find(chat => parseInt(chat.other_user_id) === target_user_id)) {
      return c.json({
        success: true,
        message: '',
        body: chats
      })
    }

    chats.unshift({
      id: 0,
      timestamp: new Date(),
      message: '',
      other_user_id: trargetUser.id,
      user_id: target_user_id,
      full_name: trargetUser.full_name,
      profile_photo_path: trargetUser.profile_photo_path
    });

    return c.json({
      success: true,
      message: '',
      body: chats
    })
}
)



export default app

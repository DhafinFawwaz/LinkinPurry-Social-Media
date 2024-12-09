import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse, UserSchema } from '../schema.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'
import { redis } from '../db/redis.js'

const app = new OpenAPIHono()

// TODO: try to optimize this with redis. invalidate cache when new chat is created

// invaldate when
// - new chat is created
async function findLatestChatWithId(userId: number): Promise<any[]> {
  // const key = `latest-chat-${userId}`;
  // const cached = await redis.get(key);
  // if(cached) {
  //   console.log(`\x1b[32m[redis] Getting latest chat Cached: ${key}\x1b[0m`)
  //   return JSON.parse(cached);
  // }

  // get all connection, join users, join chat and get the latest chat
  const chats: any[] = await db.$queryRaw`
SELECT DISTINCT
    c.id,
    c.timestamp,
    c.message,
    CASE 
        WHEN c.from_id = ${userId} THEN c.to_id
        ELSE c.from_id
    END AS other_user_id,
    u.id AS user_id,
    u.full_name,
    u.profile_photo_path
FROM connection con
JOIN users u ON con.from_id = ${userId} AND con.to_id = u.id
JOIN chat c ON (c.from_id = ${userId} AND c.to_id = u.id) OR (c.from_id = u.id AND c.to_id = ${userId})
WHERE c.timestamp = (
    SELECT MAX(timestamp)
    FROM chat
    WHERE (from_id = ${userId} AND to_id = u.id)
    OR (from_id = u.id AND to_id = ${userId})
)

  `;

  // redis.set(`latest-chat-${userId}`, JSON.stringify(chats));
  // console.log(chats);
  return chats;
}

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

    const chats = await findLatestChatWithId(userId);
    return c.json({
      success: true,
      message: '',
      body: chats.reverse()
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

  // get all connections, join users, filter out users that the current user has chatted with
  try {
    const users = await db.$queryRaw`
  SELECT DISTINCT
      u.id,
      u.full_name,
      u.profile_photo_path
  FROM connection c
  JOIN users u ON c.to_id = u.id
  WHERE (c.from_id = ${userId})
  AND NOT EXISTS (
      SELECT 1
      FROM chat
      WHERE (from_id = ${userId} AND to_id = u.id)
      OR (from_id = u.id AND to_id = ${userId})
  )
  GROUP BY u.id;
  `;
  
    return c.json({
      success: true,
      message: '',
      body: users
    })
  } catch (error) {
    console.error(error);
    return c.json({
      success: false,
      message: 'An error occurred',
    })
  }
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
      400: DefaultJsonResponse("Invalid chat"),
      401: DefaultJsonResponse("Unauthorized"),
      404: DefaultJsonResponse("User not found"),
    },
    middleware: authenticated
  }), async (c) => {
  
  try {
    const userId = c.get('user').id;
    const { target_user_id } = c.req.valid("param");

    if(userId === target_user_id) {
      c.status(400)
      return c.json({
        success: false,
        message: 'You cannot chat with yourself',
      })
    }
    
    const targetUser = await db.user.findUnique({
      where: {
        id: target_user_id
      }, select: { id: true, full_name: true, profile_photo_path: true }
    })
    if(!targetUser) {
      c.status(404)
      return c.json({
        success: false,
        message: 'User not found',
        body: null
      })
    }

    const chats: any[] = await findLatestChatWithId(userId);

    if(chats.find(chat => parseInt(chat.other_user_id) === target_user_id)) {
      return c.json({
        success: true,
        message: '',
        body: chats.reverse()
      })
    }

    chats.push({
      id: 0,
      timestamp: new Date(),
      message: '',
      other_user_id: targetUser.id,
      user_id: target_user_id,
      full_name: targetUser.full_name,
      profile_photo_path: targetUser.profile_photo_path
    });

    return c.json({
      success: true,
      message: '',
      body: chats.reverse()
    })
  } catch (error) {
    return c.json({
      success: false,
      message: 'An error occurred',
    })
  }
}
)



export default app

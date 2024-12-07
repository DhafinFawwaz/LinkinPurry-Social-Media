import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse, UserSchema, UserPrimitiveSchema } from '../schema.js'
import db from '../db/db.js'
import { authenticated } from '../middlewares/authenticated.js'
import { sendFeedNotification } from '../notification/notification.js'
import { redis } from '../db/redis.js'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'get',
      path: '/recommendation',
      description: 'Connection from connection of user that is not connected to the user requesting this endpoint and also connection from connection of connected users that is not connected to the user requesting this endpoint',
      tags: ['Recommendation'],
      responses: {
        200: DefaultJsonArrayResponse("Getting recommendation successful", UserPrimitiveSchema()),
        401: DefaultJsonResponse("Unauthorized"),
        500: DefaultJsonResponse("Failed to get recommendation")
      },
      middleware: authenticated
    }), async (c) => {

    try {
        const user = c.var.user;
        const currentUserId = user.id;
        
        // get all connection c1 c1.from_id = currentUserId join user on c1.to_id=user.id result set as connected_users1
        // join connected_users1 with connection c2 on connected_users.id = c2.from_id, result set as connected_users2
        // where connected_users2 not in connected_users1 (just use left join anc check null)

        const recommendation2nd = await db.$queryRaw`
WITH connected_users1 AS (
    SELECT c.to_id AS user_id, u.id as c1_id, u.full_name as c1_full_name
    FROM connection c
    JOIN users u ON c.to_id = u.id
    WHERE c.from_id = ${currentUserId}
),
connected_users2 AS (
    SELECT DISTINCT ON (c.to_id) c.to_id AS user_id, c1_id, c1_full_name
    FROM connection c
    JOIN connected_users1 c1 ON c1.user_id = c.from_id
    WHERE c.to_id != ${currentUserId}
)
SELECT DISTINCT ON (u.id) u.id, u.username, u.full_name, u.profile_photo_path, u.created_at, cu2.c1_id, cu2.c1_full_name
FROM connected_users2 cu2
LEFT JOIN connected_users1 cu1 ON cu2.user_id = cu1.user_id
JOIN users u ON cu2.user_id = u.id
WHERE cu1.user_id IS NULL;
        `;
        
        const recommendation3rd = 
        await db.$queryRaw`
WITH connected_users1 AS (
    SELECT c.to_id AS user_id, u.id as c1_id, u.full_name as c1_full_name
    FROM connection c
    JOIN users u ON c.to_id = u.id
    WHERE c.from_id = ${currentUserId}
),
connected_users2 AS (
    SELECT DISTINCT ON (c.to_id) c.to_id AS user_id, c1_id, c1_full_name, u.id as c2_id, u.full_name as c2_full_name
    FROM connection c
    JOIN connected_users1 c1 ON c1.user_id = c.from_id
    JOIN users u ON c.to_id = u.id
    WHERE c.to_id != ${currentUserId}
),
connected_users3 AS (
    SELECT DISTINCT ON (c.to_id) c.to_id AS user_id, c1_id, c1_full_name, c2_id, c2_full_name
    FROM connection c
    JOIN connected_users2 c2 ON c2.user_id = c.from_id
    WHERE c.to_id != ${currentUserId}
)
SELECT DISTINCT ON (u.id) u.id, u.username, u.full_name, u.profile_photo_path, u.created_at, cu3.c1_id, cu3.c1_full_name, cu3.c2_id, cu3.c2_full_name
FROM connected_users3 cu3
LEFT JOIN connected_users1 cu1 ON cu3.user_id = cu1.user_id
JOIN users u ON cu3.user_id = u.id
WHERE cu1.user_id IS NULL;
        `;


        return c.json({
            success: true,
            message: 'Getting recommendation successful',
            body: {
                users2nd: recommendation2nd,
                users3rd: recommendation3rd
            }
        })
        
    } catch(e) {
      console.log(e)
      c.status(500)
      return c.json({
          success: false,
          message: 'Getting recommendation failed',
      })
    }
  }
)

export default app


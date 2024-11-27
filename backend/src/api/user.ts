import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    method: 'get',
    path: '/users',
    description: 'Get users',
    tags: ['Profile'],
    request: {
      query: z.object({
          search: z.string().optional()
      })
    },
    responses: {
      200: DefaultJsonArrayResponse("Getting users successful", PostSchema()),
      401: DefaultJsonResponse("Unauthorized")
    },
  }), async (c) => {
    const {search} = c.req.valid("query");
    const users = await db.user.findMany({
      where: {
        full_name: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    return c.json({
      success: true,
      message: '',
      body: users
    })
}
)

export default app


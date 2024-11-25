import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import db from '../db/db.js'
import { authenticated, type JwtContent } from '../middlewares/authenticated.js'

const app = new OpenAPIHono()

app.openapi(
  createRoute({
    method: 'get',
    path: '/users',
    description: 'Get all users',
    tags: ['Profile'],
    responses: {
      200: DefaultJsonArrayResponse("Getting all users successful", PostSchema()),
      401: DefaultJsonResponse("Unauthorized")
    },
    middleware: authenticated
  }), async (c) => {
    const users = await db.user.findMany();
    return c.json({
      success: true,
      message: '',
      body: users
    })
}
)

export default app


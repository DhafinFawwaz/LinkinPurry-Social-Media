import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import db from '../db/db.js'
import { authenticated } from '../middlewares/authenticated.js'
import { sendFeedNotification } from '../notification/notification.js'

const app = new OpenAPIHono()

app.openapi(
    createRoute({
      method: 'get',
      path: '/feed',
      description: 'Get a list of posts',
      tags: ['Feed'],
      request: {
        query: z.object({
            limit: z.coerce.number().optional(),
            cursor: z.coerce.number().optional()
        })
      },
      responses: {
        200: DefaultJsonArrayResponse("Getting list of posts successful", PostSchema()),
        401: DefaultJsonResponse("Unauthorized")
      }
    }), async (c) => {

    try {
      const { limit, cursor } = c.req.valid("query");
      const feeds = await db.feed.findMany({
        take: limit || 10,
        skip: cursor || 0,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          user: true // TODO: omit password_hash
        }
      });

      return c.json({
          success: true,
          message: 'Getting list of posts successful',
          body: feeds
      })
    } catch(e) {
      console.log(e)
      c.status(422)
      return c.json({
          success: false,
          message: 'Getting list of posts failed',
      })
    }
  }
)

app.openapi(
    createRoute({
      method: 'post',
      path: '/feed',
      description: 'Create a post',
      tags: ['Feed'],
      request: DefaultJsonRequest("Create a post", { 
        content: z.string() 
      }),
      responses: {
        200: DefaultJsonResponse("Creating a post successful", PostSchema()),
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), async (c) => {
      const user = c.var.user;
      
    try {
      const { content } = c.req.valid("json");
      if(!content) {
        c.status(422);
        return c.json({
          success: false,
          message: 'Content is required',
        })
      }

      const post = await db.feed.create({
        data: {
          content,
          user_id: user.id
        }
      })


      sendFeedNotification(user.id) // no need to await

      return c.json({
          success: true,
          message: 'Creating a post successful',
          body: post
      })
    } catch(e) {
      console.log(e)
      c.status(422)
      return c.json({
          success: false,
          message: 'Creating a post failed',
      })
    }
  }
)


app.openapi(
    createRoute({
      method: 'put',
      path: '/feed/:post_id',
      description: 'Update a post by post_id',
      tags: ['Feed'],
      request: {
        params: z.object({
            post_id: z.coerce.number()
        }),
        body: {
            required: true,
            description: "Update a post by post_id",
            content: {
              'multipart/form-data': {
                schema: z.object(PostSchema())
              }
            },
        }
      },
      responses: {
        200: DefaultJsonResponse("Updating a post successful", PostSchema()),
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), async (c) => {

    const user = c.var.user;

    try {
      const { post_id } = c.req.valid("param");

      const post = await db.feed.findUnique({
        where: {
          id: post_id
        }
      })

      if(!post) {
        c.status(404);
        return c.json({
          success: false,
          message: 'Post not found',
        })
      }

      if(Number(post.user_id) !== user.id) {
        c.status(401);
        return c.json({
          success: false,
          message: 'Unauthorized',
        })
      }

      const { content } = c.req.valid("form");

      if(!content) {
        c.status(422);
        return c.json({
          success: false,
          message: 'Content is required',
        })
      }

      const updatedPost = await db.feed.update({
        where: {
          id: post_id
        },
        data: {
          content
        }
      })

      return c.json({
          success: true,
          message: 'Updating a post successful',
          body: updatedPost
      })
    } catch(e) {
      console.log(e)
      c.status(422)
      return c.json({
          success: false,
          message: 'Updating a post failed',
      })
    }
  }
)

app.openapi(
    createRoute({
      method: 'delete',
      path: '/feed/:post_id',
      description: 'Delete a post by post_id',
      tags: ['Feed'],
      request: {
        params: z.object({
            post_id: z.coerce.number()
        })
      },
      responses: {
        200: DefaultJsonResponse("Deleting a post successful", PostSchema()),
        401: DefaultJsonResponse("Unauthorized")
      },
      middleware: authenticated
    }), async (c) => {

    const user = c.var.user;

    try {
      const { post_id } = c.req.valid("param");

      const post = await db.feed.findUnique({
        where: {
          id: post_id
        }
      })

      if(!post) {
        c.status(404);
        return c.json({
          success: false,
          message: 'Post not found',
        })
      }

      if(Number(post.user_id) !== user.id) {
        c.status(401);
        return c.json({
          success: false,
          message: 'Unauthorized',
        })
      }

      await db.feed.delete({
        where: {
          id: post_id
        }
      })

      return c.json({
          success: true,
          message: 'Deleting a post successful',
          body: post
      })
    } catch(e) {
      console.log(e)
      c.status(422)
      return c.json({
          success: false,
          message: 'Deleting a post failed',
      })
    }
  }
)

export default app


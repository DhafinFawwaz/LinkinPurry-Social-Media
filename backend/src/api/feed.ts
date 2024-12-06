import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonResponse, DefaultJsonRequest, PostSchema, DefaultJsonArrayResponse } from '../schema.js'
import db from '../db/db.js'
import { authenticated } from '../middlewares/authenticated.js'
import { sendFeedNotification } from '../notification/notification.js'
import { redis } from '../db/redis.js'

const app = new OpenAPIHono()

async function invalidateFeedCache() {
  console.log('Invalidating cache')
  const script = `
    local keys = redis.call('keys', 'feeds_*')
    if #keys > 0 then
      return redis.call('del', unpack(keys))
    else
      return 0
    end
  `;
  await redis.eval(script, 0);
}
async function getFeedCache(cursor: number|undefined, limit: number|undefined) {
  const cached = await redis.get(`feeds_${cursor ? cursor : -1}_${limit ? limit : 10}`)
  if(cached) return JSON.parse(cached)
  return null
}
async function setCacheFeed(cursor: number|undefined, limit: number|undefined, data: any) {
  await redis.set(`feeds_${cursor ? cursor : -1}_${limit ? limit : 10}`, JSON.stringify(data))
}

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
        }),
      },
      responses: {
        200: DefaultJsonResponse("Getting list of posts successful", {
          feeds: z.array(z.object(PostSchema())),
          cursor: z.number().or(z.string()).optional()
        }),
        401: DefaultJsonResponse("Unauthorized")
      }
    }), async (c) => {

    try {
      // const { limit, cursor } = c.req.valid("query");
      // const limit = c.req.query("limit") as number | undefined;
      // const cursor = c.req.query("cursor") as number | undefined;
      const query = c.req.query();
      const limit_temo = query.limit;
      const cursor_temo = query.cursor;
      const limit = limit_temo ? Number(limit_temo) : undefined;
      const cursor = cursor_temo ? Number(cursor_temo) : undefined;

      const cached = await getFeedCache(cursor, limit);
      if(cached) {
        console.log("\x1b[32m Cached \x1b[0m")
        return c.json(cached)
      }


      let feeds: any[] = []
      if(cursor) {
        feeds = await db.feed.findMany({
          take: limit || 10,
          skip: 1,
          orderBy: {
            id: 'desc'
          },
          cursor: {
            id: cursor || 0
          },
          select: {
            id: true,                                                                                                                                                     
            created_at: true,
            updated_at: true,                                                                                                                             
            content: true,                                                                                                                                                  
            user_id: true,
            user: {
              select: {
                id: true,
                full_name: true,
                profile_photo_path: true
              }
            } 
          }
        });
      } else {
        // console.log('no cursor')
        feeds = await db.feed.findMany({
          take: limit || 10,
          orderBy: {
            id: 'desc'
          },
          select: {
            id: true,                                                                                                                                                     
            created_at: true,
            updated_at: true,                                                                                                                             
            content: true,                                                                                                                                                  
            user_id: true,
            user: {
              select: {
                id: true,
                full_name: true,
                profile_photo_path: true
              }
            } 
          }
        });
      }
      
      let newCursor = null;
      if(feeds.length > 0) {
        newCursor = feeds[feeds.length - 1].id
      }
      // console.log(newCursor)

      const res = {
        success: true,
        message: 'Getting list of posts successful',
        body: {
          feeds: feeds,
          cursor: newCursor
        }
      }

      setCacheFeed(cursor, limit, res)

      return c.json(res)
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

      invalidateFeedCache();


      sendFeedNotification(user) // no need to await

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
              'application/json': {
                schema: z.object({
                  content: z.string()
                })
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

      const { content } = c.req.valid("json");

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

      invalidateFeedCache();

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
      invalidateFeedCache();

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


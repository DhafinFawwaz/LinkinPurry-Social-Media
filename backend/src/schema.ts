import type { Context } from "hono";
import type { Server } from "socket.io";
import { z } from '@hono/zod-openapi'

export function DefaultJsonResponse(description: string, body?: z.ZodRawShape) {
  const schema: { success: z.ZodBoolean, message: z.ZodString, body?: any } = {
    success: z.boolean(),
    message: z.string(),
  }
  if (body) schema['body'] = z.object(body)
  return {
    description: description,
    content: {
      'application/json': {
        schema: z.object(schema)
      }
    }
  }
}

export function DefaultJsonRequest(description: string | undefined = undefined, body: z.ZodRawShape) {
  return {
    body: {
      required: true,
      description: description,
      content: {
        'application/json': {
          schema: z.object(body)
        }
      },
    }
  }
}

export function PostSchema() {
  return {
    post_id: z.number(),
    content: z.string(),
  };
}
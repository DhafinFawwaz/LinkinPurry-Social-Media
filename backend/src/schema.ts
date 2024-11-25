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
export function DefaultJsonArrayResponse(description: string, body?: z.ZodRawShape) {
  const schema: { success: z.ZodBoolean, message: z.ZodString, body?: any } = {
    success: z.boolean(),
    message: z.string(),
  }
  if (body) schema['body'] = z.array(z.object(body))
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
    id: z.number().or(z.bigint()),
    created_at: z.date(),
    updated_at: z.date(),
    content: z.string(),
    user_id: z.number().or(z.bigint()),
  };
}

export function UserSchema() {
  return {
    id: z.number().or(z.bigint()),
    created_at: z.date(),
    updated_at: z.date(),
    username: z.string(),
    work_history: z.string().nullable(),
    skills: z.string().nullable(),
    email: z.string(),
    // password_hash: z.string(),
    full_name: z.string().nullable(),
    profile_photo_path: z.string(),
  }
}

export function PostSchemaWithUser() {
  return {
    id: z.number().or(z.bigint()),
    created_at: z.date(),
    updated_at: z.date(),
    content: z.string(),
    user_id: z.number().or(z.bigint()),
    user: UserSchema()
  };
}
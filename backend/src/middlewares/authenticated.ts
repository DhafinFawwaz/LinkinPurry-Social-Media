import { createMiddleware } from "hono/factory";
import { getUser } from "../api/auth.js";
import type { MiddlewareHandler } from "hono";

export type JwtContent = {
    id: number,
    username: string,
    email: string,
    full_name: string,
    work_history: string,
    skills: string,
    profile_photo_path: string,
    iat: number,
    exp: number
  }
export const authenticated = createMiddleware<{
    Variables: {
        user: JwtContent
    }
}>(async (c, next) => {
    const user = await getUser(c);
    if(!user) {
        c.status(401)
        return c.json({
            success: false,
            message: 'Unauthorized',
        })
    }

    c.set('user', user);
    await next()
})
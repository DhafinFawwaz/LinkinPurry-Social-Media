import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonRequest, DefaultJsonResponse } from '../schema.js'
import db from '../db/db.js'
// import bcrypt 
import { Jwt } from 'hono/utils/jwt';
import bcrypt from "bcrypt";
import { setCookie } from 'hono/cookie';
import type { Context } from 'hono';
import { authenticated, type JwtContent } from "../middlewares/authenticated.js"

const app = new OpenAPIHono()


async function login(c: Context, id: number, username: string, email: string, full_name: string|null, work_history: string|null, skills: string|null, profile_photo_path: string|null) {
  const iat = Math.floor(Date.now() / 1000)
  const exp = Math.floor(Date.now() / 1000) + 60 * 60
  const token = await Jwt.sign({
    id: id,
    username: username, 
    email: email, 
    full_name: full_name,
    work_history: work_history || "",
    skills: skills || "",
    profile_photo_path: profile_photo_path || "",
    iat: iat, // issued at time
    exp: exp
  }, process.env.JWT_SECRET || "supersecretjwtsecret")

  setCookie(c, 'token', token, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    expires: new Date(exp * 1000),
  })

  return token;
}

app.openapi(
  createRoute({
    method: 'post',
    path: '/login',
    description: 'Login to an account',
    tags: ['Auth'],
    request: DefaultJsonRequest("Login to an account", {
      identifier: z.string(),
      password: z.string()
    }),
    responses: {
      200: DefaultJsonResponse("Login to an account successful", {
        token: z.string()
      }),
      401: DefaultJsonResponse("Invalid credentials")
    }
  }), async (c) => {
    try {
      const { identifier, password } = c.req.valid("json");
      let user = await db.user.findFirst({
        where: {
          OR: [
            {
              email: identifier
            },
            {
              username: identifier
            }
          ]
        }
      })
      if(!user) {
        c.status(401)
        return c.json({
          success: false,
          message: 'Login failed',
          errors: {
            identifier: 'Username or email not found',
          }
        })
      }
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if(!isPasswordValid) {
        c.status(401)
        return c.json({
          success: false,
          message: 'Login failed',
          errors: {
            password: 'Password is incorrect',
          }
        })
      }
      const token = await login(c, Number(user.id), user.username, user.email, user.full_name, user.work_history, user.skills, user.profile_photo_path)
      
      return c.json({
        success: true,
        message: 'Login success',
        body: {
            token: token,
        }
      })
    } catch(e) {
      console.log(e)
      c.status(401)
      return c.json({
        success: false,
        message: 'Login failed',
      })
    }
  }
)

app.openapi(
  createRoute({
    method: 'post',
    path: '/register',
    description: 'Register to an account',
    tags: ['Auth'],
    request: DefaultJsonRequest("Register an account", {
      username: z.string(),
      email: z.string().email(),
      name: z.string(),
      password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Za-z]/, "Password must contain at least one letter").regex(/\d/, "Password must contain at least one number")
    }),
    responses: {
      200: DefaultJsonResponse("Register to an account", {
        token: z.string()
      }),
      422: DefaultJsonResponse("Email is taken")
    },

  }), async (c) => {
    try {
      const { username, email, name, password } = c.req.valid("json");

      // Check if email or username is taken
      let user = await db.user.findFirst({
        where: {
          email
        }
      })
      if(user) {
        c.status(422)
        return c.json({
          success: false,
          message: 'Register failed',
          errors: {
            email: 'Email is taken',
          }
        })
      }
      user = await db.user.findFirst({
        where: {
          username
        }
      })
      if(user) {
        c.status(422)
        return c.json({
          success: false,
          message: 'Register failed',
          errors: {
            username: 'Username is taken',
          }
        })
      }

      // Create user
      const saltRound = process.env.SALT_ROUND ? Number.parseInt(process.env.SALT_ROUND) : 10;
      const hashedPassword: string = await bcrypt.hash(password, saltRound);
      const newUser = await db.user.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          full_name: name,
        }
      })
      
      
      const token = await login(c, Number(newUser.id), newUser.username, email, newUser.full_name, newUser.work_history, newUser.skills, newUser.profile_photo_path)
      console.log(c.res.headers)
      return c.json({
        success: true,
        message: 'Register success',
        body: {
            token: token,
        }
      })

    } catch(e) {
      console.log(e)
      c.status(422)
      return c.json({
        success: false,
        message: 'Register failed',
      })
    }

    
  }
)


app.openapi(
  createRoute({
    method: 'get',
    path: '/auth',
    description: 'Verify if user is authenticated',
    tags: ['Auth'],
    responses: {
      200: DefaultJsonResponse("Getting list of posts successful", {
        id: z.number(),
        username: z.string(), 
        email: z.string().email(),
        full_name: z.string(),
        work_history: z.string(),
        skills: z.string(),
        profile_photo_path: z.string(),
        iat: z.number(),
        exp: z.number(),
      }),
      401: DefaultJsonResponse("Unauthorized")
    }
  }), async (c) => {
    

    // case no token provided
    if(!c.req.header("Authorization")) {
      c.status(401)
      return c.json({
        success: false,
        message: 'Unauthorized',
      })
    }

    // case invalid token
    try {
      const auth = c.req.header("Authorization")?.split(" ");
      if(!auth || auth[0] !== "Bearer") {
        throw new Error("Invalid token")
      }
      const token = auth[1];
      const payload = await Jwt.verify(token, process.env.JWT || "supersecretjwtsecret");
      return c.json({
        success: true,
        message: 'Authenticated',
        body: payload
      })
    } catch(e) {
      c.status(401)
      return c.json({
        success: false,
        message: e,
      })
    }

}
)

export async function getUser(c: Context) {
  if(!c.req.header("Authorization")) return undefined;

  try {
    const auth = c.req.header("Authorization")?.split(" ");
    if(!auth || auth[0] !== "Bearer") {
      throw new Error("Invalid token")
    }
    const token = auth[1];
    const payload = await Jwt.verify(token, process.env.JWT || "supersecretjwtsecret") as JwtContent;
    return payload;
  } catch(e) {
    return undefined;
  }
}

export default app


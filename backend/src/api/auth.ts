import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonRequest, DefaultJsonResponse } from '../schema.js'
import db from '../db/db.js'
// import bcrypt 
import { Jwt } from 'hono/utils/jwt';
import bcrypt from "bcrypt";
import { setCookie } from 'hono/cookie';
import type { Context } from 'hono';

const app = new OpenAPIHono()

async function login(c: Context, username: string, email: string, name?: any) {
  const token = await Jwt.sign({ 
    username: username, 
    email: email, 
    // name: name,
    iat: Math.floor(Date.now() / 1000), // issued at time
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  }, process.env.JWT || "supersecretjwtsecret")
  setCookie(c, 'token', token)
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
      const token = login(c, user.username, user.email)
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
      await db.user.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
        }
      })
      
      
      const token = login(c, username, email)
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


export default app


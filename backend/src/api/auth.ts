import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { DefaultJsonRequest, DefaultJsonResponse } from '../schema.js'

const app = new OpenAPIHono()

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
  }), (c) => {

    return c.json({
      success: true,
      message: 'Login success',
      body: {
          token: '',
      }
    })
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

  }), (c) => {
    try {
      const {username} = c.req.valid("json");
      console.log(username)
    } catch(e) {
      console.log(e)
    }

    return c.json({
      success: true,
      message: 'Register success',
      body: {
          token: '',
      }
    })
  }
)


export default app


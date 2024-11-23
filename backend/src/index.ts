import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Redis } from 'ioredis'
import "./bigint-extension"
import authRoute from './api/auth.js'
import feedRoute from './api/feed.js'
import profileRoute from './api/profile.js'
import { handleSocket } from './socket/chat.js'
import { Server } from 'socket.io'

const app = new OpenAPIHono()
const prisma = new PrismaClient()

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
app.use('/*', cors({origin: [corsOrigin]}))

app.get('/doc', swaggerUI({ url: '/api/doc' }))
app.doc('/api/doc', { info: { title: 'API Documentation', version: 'v1' }, openapi: '3.1.0'})

const redis = new Redis({
  host: (process.env.REDIS_HOST || 'localhost') as string,
  port: (process.env.REDIS_PORT || 6379) as number
});
redis.on('error', (err) => {
  console.error(err)
});

// dont use .get direcly. use .openapi like above so we can generate the documentation automatically. this is only for example
app.get('/', async (c) => {
  const rand = Math.random()
  await redis.set('hello', rand)
  await prisma.user.create({
    data: {
      email: rand + '@example.com',
      username: rand.toString(),
      password_hash: "password123",
    }
  })
  const allUser = await prisma.user.findMany()
  return c.json({ message: 'Hello World', redis: await redis.get('hello'), users: allUser })
})

// Start here
app.route('/api', authRoute)
app.route('/api', feedRoute)
app.route('/api', profileRoute)

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 4000;
console.log(`Server is running on http://localhost:${port}`)

const server = serve({
  fetch: app.fetch,
  port
})

const io = new Server(server, {cors: {origin: corsOrigin}});
handleSocket(io)
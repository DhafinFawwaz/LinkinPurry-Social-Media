import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Redis } from 'ioredis'
import "./bigint-extension"
import authRoute from './api/auth.js'
import feedRoute from './api/feed.js'
import profileRoute from './api/profile.js'
import userRoute from './api/user.js'
import { handleSocket } from './socket/chat.js'
import { Server } from 'socket.io'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new OpenAPIHono()

app.use('/*', async (c, next) => cors({origin: getCorsOrigin(c), credentials: true})(c, next))
app.get('/doc', swaggerUI({ url: '/api/doc' }))
app.doc('/api/doc', { info: { title: 'API Documentation', version: 'v1' }, openapi: '3.1.0'})
app.use('/uploads/img/*', serveStatic({ root: './src/' }))
app.route('/api', authRoute)
app.route('/api', feedRoute)
app.route('/api', profileRoute)
app.route('/api', userRoute)

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 4000;
console.log(`Server is running on http://localhost:${port}`)

const server = serve({
  fetch: app.fetch,
  port
})


var corsOrigin;
function getCorsOrigin(c: Context) {
  const origins = process.env.CORS_ORIGIN || 'http://localhost:3000'
  let host = c.req.header("Host")
  if(!host) host = "localhost"
  if(host?.includes(":")) {
    const [hostname, port] = host.split(":")
    corsOrigin = [hostname+":"+port, hostname, host, origins]
    return corsOrigin;
  }
  corsOrigin = [host, origins]
  return corsOrigin;
}

const io = new Server(server, {cors: {origin: corsOrigin}});
handleSocket(io)


const redis = new Redis({
  host: (process.env.REDIS_HOST || 'localhost') as string,
  port: (process.env.REDIS_PORT || 6379) as number
});
redis.on('error', (err) => {
  console.error(err)
});
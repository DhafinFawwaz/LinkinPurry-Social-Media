import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import "./bigint-extension"
import authRoute from './api/auth.js'
import feedRoute from './api/feed.js'
import profileRoute from './api/profile.js'
import userRoute from './api/user.js'
import chatRoute from './api/chat.js'
import notificationRoute from './api/notification.js'
import dbHealthRoute from './api/dbhealth.js'
import { handleSocket } from './socket/chat.js'
import { Server } from 'socket.io'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'

const app = new OpenAPIHono()

app.use('/*', async (c, next) => cors({origin: getCorsOrigin(c), credentials: true})(c, next))
app.get('/doc', swaggerUI({ url: '/api/doc' }))
app.doc('/api/doc', { info: { title: 'API Documentation', version: 'v1' }, openapi: '3.1.0'})
app.use('/uploads/img/*', serveStatic({ root: './' }))
app.route('/api', authRoute)
app.route('/api', feedRoute)
app.route('/api', profileRoute)
app.route('/api', userRoute)
app.route('/api', chatRoute)
app.route('/api', notificationRoute)
app.route('/health', dbHealthRoute)
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
console.log(`Server is running on http://localhost:${port}`)

const server = serve({
  fetch: app.fetch,
  port
})


function getCorsOrigin(c: Context) {
  const origins = process.env.CORS_ORIGIN || 'http://localhost:4000'
  let host = c.req.header("Host")
  if(!host) host = "localhost"
  if(host?.includes(":")) {
    const [hostname, port] = host.split(":")
    return [hostname+":"+port, hostname, host, origins];
  }
  return [host, origins];
}

function getCorsOriginSocket() {
  const origins = ['http://localhost:4000', process.env.CORS_ORIGIN || ""]
  return origins;
  // return "http://localhost:4000";
}
const io = new Server(server, {cors: {origin: getCorsOriginSocket(), credentials: true}});
handleSocket(io)


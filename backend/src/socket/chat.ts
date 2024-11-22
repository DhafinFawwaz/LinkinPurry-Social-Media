import { serve } from '@hono/node-server'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Server } from 'socket.io'

export function handleSocket(io: Server) {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('chat message', (msg) => {
            console.log('message: ' + msg);
        });
    });
}





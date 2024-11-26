import { serve } from '@hono/node-server'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Server } from 'socket.io'

export function handleSocket(io: Server) {
	io.on("connection", (socket) => {
		socket.join("room1");
		socket.on("message", (arg) => {
			socket.to("room1").emit("message", arg);
		});
	});
}





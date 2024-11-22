import type { Context } from "hono";
import type { Server } from "socket.io";

export type socketParam = {
    Variables: {
      io: Server
    }
}

export type socketContex = Context<socketParam, string, {}>
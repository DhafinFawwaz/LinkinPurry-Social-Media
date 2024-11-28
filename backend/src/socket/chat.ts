import { serve } from '@hono/node-server'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { Server } from 'socket.io'
import type { JwtContent } from '../middlewares/authenticated.js';
import { decodeToken } from '../api/auth.js';
import { parse } from 'cookie';
import db from '../db/db.js';

function sortIds(id1: number, id2: number): [number, number]{
	id1 = Number(id1);
	id2 = Number(id2);
	if(id1 < id2) return [id1, id2];
	return [id2, id1];
}

async function isBothUserConnected(user1Id: number, user2Id: number) {
	const [smallId, bigId] = sortIds(user1Id, user2Id);
	const connection = await db.connection.findFirst({
		where: {
			// from_id: smallId,
			// to_id: bigId
			from_id: bigId,
			to_id: smallId
		}
	})
	if(!connection) return false;
	return true;
}

function successResponse(message: string, body: any) {
	return JSON.stringify({success: true, message: message, body: body});
}
function errorResponse(message: string) {
	return JSON.stringify({success: false, message: message});
}

async function findAllChats(user1Id: number, user2Id: number) {
	const [small_id, big_id] = sortIds(user1Id, user2Id);
	const chats = await db.chat.findMany({
		where: {
			OR: [
				{
					from_id: small_id,
					to_id: big_id
				},
				{
					from_id: big_id,
					to_id: small_id
				}
			]
		},
		orderBy: {
			timestamp: "asc"
		}
	})
	return chats;
}
async function sendChat(fromId: number, toId: number, message: string) {
	await db.chat.create({
		data: {
			from_id: fromId,
			to_id: toId,
			message: message
		}
	})
}

function getRoomKey(user1Id: number, user2Id: number) {
	const [small_id, big_id] = sortIds(user1Id, user2Id);
	return `room_${small_id}_${big_id}`;
}

const CONNECT = 'connect';
const DISCONNECT = 'disconnect';

const CHAT_JOIN = 'chat:join';
const CHAT_JOIN_SUCCESS = 'chat:join|success';
const CHAT_JOIN_ERROR = 'chat:join|error';

const CHAT_LEAVE = 'chat:leave';
const CHAT_LEAVE_SUCCESS = 'chat:leave|success';
const CHAT_LEAVE_ERROR = 'chat:leave|error';

const MESSAGE_SEND = 'message:send';
const MESSAGE_SEND_SUCCESS = 'message:send|success';
const MESSAGE_SEND_ERROR = 'message:send|error';

const MESSAGE_RECEIVED = 'message:received';

export function handleSocket(io: Server) {
	io.on(CONNECT, async(socket) => {
		try {
			const cookie = socket.handshake.headers.cookie ?? '';
			const parsedCookie = parse(cookie);
			const token = parsedCookie.token;
			if(!token) {
				socket.disconnect();
				return;
			}
			const user = await decodeToken(token);
			if(!user) {
				socket.disconnect();
				return;
			}

			socket.on(CHAT_JOIN, async (targetUserId: number) => {
				try {
					if(!(await isBothUserConnected(user.id, targetUserId))) {
						socket.emit(MESSAGE_SEND_ERROR, errorResponse("User is not connected"));
						return;
					}
					const roomKey = getRoomKey(user.id, targetUserId);
					await socket.join(roomKey);
					const chats = await findAllChats(user.id, targetUserId);
					socket.emit(CHAT_JOIN_SUCCESS, successResponse("Joined chat", {room: roomKey, chats: chats}));
				} catch (e) {
					socket.emit(CHAT_JOIN_ERROR, errorResponse("Failed to join chat"));
				}
			})

			socket.on(MESSAGE_SEND, async (targetUserId: number, message: string) => {
				const roomKey = getRoomKey(user.id, targetUserId);
				try {
					await sendChat(user.id, targetUserId, message);
					const chats = await findAllChats(user.id, targetUserId);
					io.to(roomKey).emit(MESSAGE_RECEIVED, successResponse("Sent chat", {room: roomKey, chats: chats}));
					socket.emit(MESSAGE_SEND_SUCCESS, successResponse("Sent chat", {room: roomKey, chats: chats}));
				} catch (e) {
					socket.emit(MESSAGE_SEND_ERROR, errorResponse("Failed to send chat"));
				}
			})

			socket.on(CHAT_LEAVE, async (targetUserId: number) => {
				const roomKey = getRoomKey(user.id, targetUserId);
				try {
					await socket.leave(roomKey);
					socket.emit(CHAT_LEAVE_SUCCESS, successResponse("Left chat", {room: roomKey}));
				} catch (e) {
					socket.emit(CHAT_LEAVE_ERROR, errorResponse("Failed to leave chat"));
				}
			})

		} catch (e) {
			socket.disconnect();
			return;
		}

	});

	io.on(DISCONNECT, (socket) => {
		socket.disconnect();
	})
}



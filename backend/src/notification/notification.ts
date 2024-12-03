import db from "../db/db.js";
import type { JwtContent } from "../middlewares/authenticated.js";
import webpush from "./webpush.js";
import type { PushSubscription } from 'web-push';

async function getAllConnectedUsers(userId: number) {
	return await db.connection.findMany({
		where: {
			to_id: userId
		},
		include: {
			from: {
				include: {
					push_subscriptions: true
				}
			}
		}
	})
}
async function getUserPushSubscriptionById(userId: number) {
	return await db.user.findUnique({
		where: {
			id: userId
		},
		include: {
			push_subscriptions: true
		}
	})
}

const origin = process.env.CORS_ORIGIN || 'http://localhost:3000'
const host = process.env.HOST || 'http://localhost:4000'

export async function sendFeedNotification(user: JwtContent) {
	const connections = await getAllConnectedUsers(user.id)

	const targets = [];
	for (const c of connections) {
		const notificationPayload = {
			title: `New post from ${user.full_name}`,
			body: ``,
			icon: `${host}${user.profile_photo_path}`,
			data: {
				url: `${origin}`,
			},
		};

		for(const s of c.from.push_subscriptions) {
			const subscription: PushSubscription = {
				endpoint: s.endpoint,
				keys: s.keys as any
			}
			targets.push(webpush.sendNotification(subscription, JSON.stringify(notificationPayload)))
		}
	}
	try {
		const res = await Promise.all(targets)
		console.log("Notification sent successfully")
	} catch (error) {
		console.error("Error sending notification for feed", error)
	}
}

export async function sendChatNotification(user: JwtContent, targetUserId: number, message: string) {
	const targetUser = await getUserPushSubscriptionById(targetUserId)
	if(!targetUser) {
		console.log("Sending chat notification failed, user not found")
		return;
	}
	const notificationPayload = {
		title: `New message from ${user.full_name}`,
		body: message,
		icon: user.profile_photo_path,
		data: {
			url: `${origin}/chat/${user.id}`,
		},
	};

	const targets = [];
	for(const s of targetUser.push_subscriptions) {
		const subscription: PushSubscription = {
			endpoint: s.endpoint,
			keys: s.keys as any
		}
		targets.push(webpush.sendNotification(subscription, JSON.stringify(notificationPayload)))
	}
	try {
		const res = await Promise.all(targets)
		console.log("Notification sent successfully")
	} catch (error) {
		console.error("Error sending notification for subscription", error)
	}
}
import db from "../db/db.js";
import webpush from "./webpush.js";

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

export async function sendFeedNotification(userId: number) {
	const connections = await getAllConnectedUsers(userId)

	const targets = [];
	for (const c of connections) {
		const notificationPayload = {
			title: `New post from ${c.from.full_name}`,
			body: ``,
			icon: c.from.profile_photo_path,
			data: {
				url: `/feed`,
			},
		};

		for(const s of c.from.push_subscriptions) {
			targets.push(webpush.sendNotification(s.endpoint as any, JSON.stringify(notificationPayload)))
		}
	}
	const res = await Promise.all(targets)

	for (const r of res) {
		if (r.statusCode === 201) {
			console.log("Notification sent successfully")
		} else {
			console.error("Error sending notification for subscription", r)
		}
	}
}

export async function sendChatNotification(userId: number, message: string) {
	const connections = await getAllConnectedUsers(userId)

	const targets = [];
	for (const c of connections) {
		const notificationPayload = {
			title: `New message from ${c.from.full_name}`,
			body: message,
			icon: c.from.profile_photo_path,
			data: {
				url: `/chat/${c.from_id}`,
			},
		};

		for(const s of c.from.push_subscriptions) {
			targets.push(webpush.sendNotification(s.endpoint as any, JSON.stringify(notificationPayload)))
		}
	}
	const res = await Promise.all(targets)

	for (const r of res) {
		if (r.statusCode === 201) {
			console.log("Notification sent successfully")
		} else {
			console.error("Error sending notification for subscription", r)
		}
	}
}
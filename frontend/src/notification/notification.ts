import { fetchApi, getApiUrl } from "../hooks/useFetchApi";

const notificationEndpointKey = "notification-endpoint";

export function tryRegisterServiceWorker() {
	if ("serviceWorker" in navigator && "Notification" in window) {
		async function handleServiceWorker() {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				return;
			}

			const registrations = await navigator.serviceWorker.getRegistrations();
			for (const registration of registrations) {
				if (registration.active?.scriptURL === `${window.location.origin}/sw.js`) {
					if(!localStorage.getItem(notificationEndpointKey)) {
						registration.unregister();
						return;
					}
					return;
				}
			}
			const register = await navigator.serviceWorker.register("/sw.js");
			
			await new Promise((resolve) => { // wait for service worker to be activated
				if (register.installing) {
					register.installing.onstatechange = () => {
						if (register.installing?.state === "activated") {
							resolve(null);
						}
					};
				} else {
					resolve(null);
				}
			});

			const subscription = await register.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
			});
			
			const res = await fetchApi(`/api/notification/subscribe`, {
				method: "POST",
				body: JSON.stringify({subscription}),
				headers: {
					"content-type": "application/json",
				},
			});

			await res.json();
			// const data = await res.json();
			// console.log(data);
			localStorage.setItem(notificationEndpointKey, subscription.endpoint);
		};
		handleServiceWorker();
	} else {
		console.log("Service Worker or Notifications API not supported");
	}
}

export async function tryRemoveServiceWorker() {
	if ("serviceWorker" in navigator) {
		const endPoint = localStorage.getItem(notificationEndpointKey);
		const registrations = await navigator.serviceWorker.getRegistrations();
		for (const registration of registrations) {
			await registration.unregister();
		}

		if (!endPoint) {
			return;
		}
		const res = await fetchApi(`/api/notification/unsubscribe`, {
			method: "POST",
			body: JSON.stringify({ endpoint: endPoint }),
			headers: {
				"content-type": "application/json",
			},
		});
		if (!res.ok) {
			console.log("Failed to remove subscription");
		}

		
	} else {
		console.log("Service Worker not supported");
	}
}
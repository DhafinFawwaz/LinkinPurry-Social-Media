import { getApiUrl } from "../hooks/useFetchApi";


export function tryRegisterServiceWorker() {
	if ("serviceWorker" in navigator && "Notification" in window) {
		async function handleServiceWorker() {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				return;
			}

			const register = await navigator.serviceWorker.register("/sw.js");

			const subscription = await register.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: "VAPID_PUBLIC_KEY",
			});

			const res = await fetch(`${getApiUrl()}/notification`, {
				method: "POST",
				body: JSON.stringify(subscription),
				headers: {
					"content-type": "application/json",
				},
			});

			const data = await res.json();
			console.log(data);
		};
		handleServiceWorker();
	} else {
		console.log("Service Worker or Notifications API not supported");
	}
}
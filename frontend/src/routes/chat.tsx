import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const socket = io(URL, {
	autoConnect: false,
	auth: {
		token: ""
	}
});

export default function Chat() {
	const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
		}
		function onDisconnect() {
			setIsConnected(false);
		}
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);

		socket.on("message", (arg) => {
			console.log(arg);
		});

		// for debugging
		socket.onAny((event, ...args) => {
			console.log(event, args);
		});

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
		}
	}, []);

	function onSubmit(e: any) {
		e.preventDefault();
		socket.emit("message", "Helloooooo");
	}

	return (
		<div>
			<br />
			<br />
			<br />
			<h1>Chat</h1>
			<button onClick={() => socket.connect()}>Connect</button>
			<button onClick={() => socket.disconnect()}>Disconnect</button>
			<form onSubmit={ onSubmit }>
				<button type="submit">Submit</button>
			</form>
			<div>
				<h2>Connection Status</h2>
				<p>{isConnected ? 'Connected' : 'Disconnected'}</p>
			</div>
		</div>
	);
}
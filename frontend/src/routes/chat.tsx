import { useEffect, useRef, useState } from 'react';
import socket from '../socket/socket';
import { useParams } from 'react-router-dom';
import { ChatErrorResponse, ChatMessage, ChatResponse, LatestChat, LatestChatResponse } from '../type';
import chatController from '../socket/chat-controller';
import useFetchApi from '../hooks/useFetchApi';

export default function Chat() {
	const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
	const param = useParams<{ user_id: string }>();
	const inputRef = useRef<HTMLInputElement>(null);
	const [chats, setChats] = useState<ChatMessage[]>([]);

	const { loading, value, error, recall } = useFetchApi<LatestChatResponse>("/api/chats");

	useEffect(() => {
		chatController.reinitialize({
			onConnect: () => setIsConnected(true),
			onDisconnect: () => setIsConnected(false),
			onChatJoinSuccess: res => {
				setChats(res.body.chats);
			},
			onChatJoinError: e => {},
			onChatSendSuccess: r => {
				setChats(r.body.chats);
			},
			onChatSendError: e => {},
			onChatLeaveSuccess: r => {},
			onChatLeaveError: e => {},
			onMessageReceived: res => {
				setChats(res.body.chats);
			},
		});
		chatController.connect();
		chatController.joinChat(parseInt(param.user_id!));


		// for debugging
		// socket.onAny((event, ...args) => {
		// 	console.log(event, args);
		// });

		return () => {
			chatController.unsubscribe();
		}
	}, []);

	function onSubmit(e: any) {
		e.preventDefault();
		chatController.sendMessage(parseInt(param.user_id!), inputRef.current!.value);
	}

	return (
		<div>
			<br />
			<br />
			<br />
			<h1>Chat</h1>
			<button onClick={() => socket.disconnect()}>Disconnect</button>
			<form onSubmit={ onSubmit }>
				<input type="text" name="" id="" ref={inputRef} />
				<button type="submit">Submit</button>
			</form>
			<div>
				<h2>Connection Status</h2>
				<p>{isConnected ? 'Connected' : 'Disconnected'}</p>
			</div>
			<div>
				{chats.map((chat, i) => (<div key={i}>
					{JSON.stringify(chat)}
				</div>))}
			</div>
			{JSON.stringify(value?.body)}
		</div>
	);
}
import { useEffect, useRef, useState } from 'react';
import socket from '../socket/socket';
import { useParams } from 'react-router-dom';
import { ChatErrorResponse, ChatMessage, ChatResponse, LatestChat, LatestChatResponse, User } from '../type';
import chatController from '../socket/chat-controller';
import useFetchApi, { fetchApi } from '../hooks/useFetchApi';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

export default function Chat({ user }: { user?: User}) {
	const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
	const param = useParams<{ user_id: string }>();
	const inputRef = useRef<HTMLInputElement>(null);
	const [messages, setMessages] = useState<null|{
		message: ChatMessage[];
		details: LatestChat;
	}>(null);

	const [value, setValue] = useState<LatestChatResponse | null>(null);
	function setMessagesFromResponse(res: ChatResponse) {
		setValue((prev) => {
			if (!prev) return prev; // Ensure prevValue exists
			const details = prev.body.find(c => (c.other_user_id) === parseInt(param.user_id!))!;
			setMessages({
				message: res.body.chats,
				details: details,
			});
			return prev;
		});
	}

	useEffect(() => {
		chatController.connect();
		chatController.unsubscribe();

		(async () => {
			chatController.reinitialize({
				onConnect: () => setIsConnected(true),
				onDisconnect: () => setIsConnected(false),
				onChatJoinSuccess: setMessagesFromResponse,
				onChatJoinError: e => {},
				onChatSendSuccess: setMessagesFromResponse,
				onChatSendError: e => {},
				onChatLeaveSuccess: r => {},
				onChatLeaveError: e => {},
				onMessageReceived: r => setMessagesFromResponse,
			});
			chatController.joinChat(parseInt(param.user_id!));
			const res = await fetchApi('/api/chats', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const json = await res.json();
			setValue(json);
		})()

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
		// scroll to bottom
	}	



	const [showNewMessage, setShowNewMessage] = useState(false); 
	const [users, setUsers] = useState([
		{ id: 1, name: 'Denise Felicia Tiowanni', avatar: null },
		{ id: 2, name: 'Bagas Sambega Rosyadi', avatar: '/bagas_avatar.png' },
		{ id: 3, name: 'Franklin Tavarez', avatar: null },
		{ id: 4, name: 'New User', avatar: '/default_avatar.png' }, // Contoh user baru ((belom work demn))
	]);


	return (<>
{!value ? <>

</> 
: 
<>
<div className="h-dvh h-screen flex justify-center items-center pt-20 pb-6">
	<div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full h-full max-w-4xl relative">
		<div className="py-1 px-4 border-b flex justify-between items-center">
			<h1 className="text-xl font-semibold my-2">Messaging</h1>  
		</div>
		<div className="flex h-full">

		<div className='absolute z-20 bottom-0 w-[37%] hidden md:flex justify-end px-8 pb-4'>
			<button type="submit" className='bg-blue_primary text-white font-semibold rounded-full hover:bg-blue_hover w-12 h-12 text-3xl'>+</button>
		</div>
		<ChatList chatList={value?.body!} selectedChatId={parseInt(param.user_id!)}>
		</ChatList>


{!messages?.message ? <>

</> : <>
<ChatWindow chatDetails={messages?.details!} messages={messages?.message!} user={user!}>
	<form onSubmit={ onSubmit } className='w-full flex'>
		<input type="text" name="" id="" ref={inputRef} placeholder='Type a message' className='p-2 mr-2 border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-3 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-blue-600 focus:bg-[#e8f0fe] hover:border-blue-600'/>
		<button type="submit" className='bg-blue_primary text-white font-semibold py-2 px-4 rounded-full hover:bg-blue_hover'>Send</button>
	</form>
</ChatWindow>
</>}

		</div>

		{/* New message dropdown */}
		{showNewMessage && (
			<div className="absolute bg-white border rounded-lg shadow-lg w-1/3 max-w-md right-80 top-32 z-10">
			<div className="p-4 border-b">
				<h2 className="text-lg font-semibold">New message</h2>
			</div>
			<ul>
				{users.map((user) => (
				<li
					key={user.id}
					className="p-4 flex items-center cursor-pointer hover:bg-gray-100"
				>
					<img
					src={user.avatar || '/jobseeker_profile.svg'}
					alt={user.name}
					className="w-8 h-8 rounded-full mr-4"
					/>
					<span className="font-medium">{user.name}</span>
				</li>
				))}
			</ul>
			</div>
		)}
	</div>
</div>
</>}

	</>
	);
}
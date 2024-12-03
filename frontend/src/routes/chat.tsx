import { useEffect, useRef, useState } from 'react';
import socket from '../socket/socket';
import { useParams } from 'react-router-dom';
import { ChatErrorResponse, ChatMessage, ChatResponse, LatestChat, LatestChatResponse, User } from '../type';
import chatController from '../socket/chat-controller';
import useFetchApi, { fetchApi } from '../hooks/useFetchApi';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import PopUp from '../components/popup';
import NewChat from '../components/chat/new-chat';

export default function Chat({ user }: { user?: User}) {
	const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
	const param = useParams<{ user_id: string }>();
	const inputRef = useRef<HTMLInputElement>(null);
	const [messages, setMessages] = useState<null|{
		message: ChatMessage[];
		details: LatestChat;
	}>(null);

	const [chats, setChats] = useState<LatestChatResponse | null>(null);
	function setMessagesFromResponse(res: ChatResponse) {
		setChats((prev) => {
			if (!prev) return prev; // Ensure prevValue exists
			const userId = parseInt(param.user_id!);
			const details = prev.body.find(c => (c.other_user_id) === userId)!;
			setMessages({
				message: res.body.chats,
				details: details,
			});
			return prev;
		});
	}

	useEffect(() => {
		console.log('chat component mounted');
		chatController.connect();
		chatController.unsubscribe();

		(async () => {
			const res = await fetchApi(`/api/chats/${parseInt(param.user_id!)}`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
				},
			});
			if(!res.ok) {
				return;
			}
			const json = await res.json();
			setChats(json);
			
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
	}	

	const [isPopUpOpen, setIsPopUpOpen] = useState(false);

	return (<>
{!chats ? <>

</> 
: 
<>

	
<PopUp title='New Message' open={isPopUpOpen} onClose={() => {setIsPopUpOpen(false)}}>
	<NewChat></NewChat>
</PopUp>
<div className="h-dvh h-screen flex justify-center items-center pt-16 pb-6">
	<div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full h-full max-w-3xl relative mx-2 mt-8 sm:mt-0">
		<div className="py-1 px-4 border-b flex justify-between items-center">
			<h1 className="text-xl font-semibold my-2">Messaging</h1>  
		</div>
		<div className="flex h-full">

	
		<div className='absolute z-20 bottom-12 sm:bottom-0 w-[37%] hidden md:flex justify-end px-8 pb-4'>
			<button onClick={() => setIsPopUpOpen(true)} type="submit" className='bg-blue_primary text-white font-semibold rounded-full hover:bg-blue_hover w-12 h-12 text-3xl'>+</button>
		</div>

		<ul className="w-full md:w-[37%] border-r overflow-y-scroll relative hidden md:block">
			{chats && chats.body.map((chat, idx) => <ChatList to={`/chat/${chat.other_user_id}`} key={idx} chat={chat} selectedChatId={parseInt(param.user_id!)}/>)}
		</ul>



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
	</div>
</div>
</>}

	</>
	);
}
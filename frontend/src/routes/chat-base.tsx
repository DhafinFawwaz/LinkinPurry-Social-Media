import { useState } from 'react';
import { LatestChatResponse } from '../type';
import ChatList from '../components/chat/ChatList';
import useFetchApi from '../hooks/useFetchApi';

export default function ChatBase() {
	const { loading, value, error, recall } = useFetchApi<LatestChatResponse>("/api/chats");

	const [showNewMessage, setShowNewMessage] = useState(false); 
	const [users, setUsers] = useState([
		{ id: 1, name: 'Denise Felicia Tiowanni', avatar: null },
		{ id: 2, name: 'Bagas Sambega Rosyadi', avatar: '/bagas_avatar.png' },
		{ id: 3, name: 'Franklin Tavarez', avatar: null },
		{ id: 4, name: 'New User', avatar: '/default_avatar.png' }, // Contoh user baru ((belom work demn))
	]);

	return (<>
{loading ? <>

</> 
: 
<>
<div className="h-dvh h-screen flex justify-center items-center pt-20 pb-6">
	<div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full h-full max-w-4xl relative">
		<div className="py-1 px-4 border-b flex justify-between items-center">
			<h1 className="text-xl font-semibold my-2">Messaging</h1>  
		</div>
		<div className="flex h-full">

		<div className='absolute z-20 bottom-0 w-full flex justify-end px-8 pb-4'>
			<button type="submit" className='bg-blue_primary text-white font-semibold rounded-full hover:bg-blue_hover w-12 h-12 text-3xl'>+</button>
		</div>
		<ul className="w-full border-r overflow-y-scroll relative">
			{value?.body.map((chat, idx) => <ChatList to={`/chat/${chat.other_user_id}`} key={idx} chat={chat} selectedChatId={-1}/>)}
		</ul>



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
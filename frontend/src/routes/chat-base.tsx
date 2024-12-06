import { useState } from 'react';
import { LatestChatResponse } from '../type';
import ChatList from '../components/chat/ChatList';
import useFetchApi from '../hooks/useFetchApi';
import PopUp from '../components/popup';
import NewChat from '../components/chat/new-chat';

export default function ChatBase() {
	const { loading, value, error, recall } = useFetchApi<LatestChatResponse>("/api/chats", 0, true, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
		},
	});

	const [isPopUpOpen, setIsPopUpOpen] = useState(false);

	return (<>
{loading ? <>

</> 
: 
<>

<PopUp title='New Message' open={isPopUpOpen} onClose={() => {setIsPopUpOpen(false)}}>
	<NewChat></NewChat>
</PopUp>
<div className="h-dvh h-screen flex justify-center items-center pt-16 pb-6">
	<div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full h-full max-w-3xl relative mx-2 mt-8 sm:mt-0">
		<div className='relative'>
			<div className="absolute z-30 h-14 px-4 border-b flex justify-between items-center">
				<h1 className="text-xl font-semibold my-2">Messaging</h1>  
			</div>
		</div>
		<div className="flex h-full pt-14">

			<div className='absolute z-20 bottom-12 sm:bottom-0 w-full flex justify-end px-8 pb-4 pointer-events-none'>
				<button onClick={() => setIsPopUpOpen(true)} type="submit" className='bg-blue_primary pointer-events-auto text-white font-semibold rounded-full hover:bg-blue_hover w-12 h-12 text-3xl'>+</button>
			</div>
			<ul className="w-full border-r overflow-y-scroll relative">
				{value?.body.map((chat, idx) => <ChatList to={`/chat/${chat.other_user_id}`} key={idx} chat={chat} selectedChatId={-1}/>)}
			</ul>


		</div>


	</div>
</div>
</>}

	</>
	);
}
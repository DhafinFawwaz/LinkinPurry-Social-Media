import React, { useState } from 'react';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  // Data dummy, frontend test purpose only
  const messages = {
    1: [
      { id: 1, from: 'Denise', text: "You're welcome", timestamp: '2023-11-23T09:38:00Z' },
      { id: 2, from: 'You', text: 'Thanks!', timestamp: '2023-11-23T09:39:00Z' },
      { id: 3, from: 'You', text: 'Thanks!', timestamp: '2023-11-23T09:39:00Z' },
      { id: 1, from: 'Denise', text: "You're welcome", timestamp: '2024-11-23T09:38:00Z' },
      { id: 1, from: 'Denise', text: "omagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiwomagama kiwkiw", timestamp: '2024-11-23T09:38:00Z' },
    ],
    2: [
      { id: 1, from: 'Bagas', text: 'omagama kiwkiw', timestamp: '2023-11-23T10:00:00Z' },
      { id: 2, from: 'You', text: 'Haha, keren!', timestamp: '2023-11-23T10:01:00Z' },
    ],
    3: [
      { id: 1, from: 'Franklin', text: 'Hi there, Muhammad...', timestamp: '2023-11-20T08:00:00Z' },
      { id: 2, from: 'You', text: 'Hello!', timestamp: '2023-11-20T08:01:00Z' },
    ],
  };

  const chatDetails = {
    1: { name: 'Denise Felicia Tiowanni', avatar: null },
    2: { name: 'Bagas Sambega Rosyadi', avatar: '/bagas_avatar.png' },
    3: { name: 'Franklin Tavarez', avatar: null },
  };

  return (
    <div className="flex justify-center items-center min-h-screen mt-10">
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full max-w-4xl h-[90vh]">
        <div className="py-3 pl-4 border-b">
          <h1 className="text-xl font-semibold">Messaging</h1>
        </div>
        <div className="flex h-full">
        <ChatList
            onSelectChat={setSelectedChat}
            selectedChat={selectedChat}
            messages={messages}
            chatDetails={chatDetails}
        />
          {selectedChat && (
            <ChatWindow
              chatDetails={chatDetails[selectedChat]}
              messages={messages[selectedChat]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

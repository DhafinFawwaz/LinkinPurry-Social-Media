import React, { useState } from 'react';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import NewMessage from '../assets/images/new-message.svg';

const Chat: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false); 
  const [users, setUsers] = useState([
    { id: 1, name: 'Denise Felicia Tiowanni', avatar: null },
    { id: 2, name: 'Bagas Sambega Rosyadi', avatar: '/bagas_avatar.png' },
    { id: 3, name: 'Franklin Tavarez', avatar: null },
    { id: 4, name: 'New User', avatar: '/default_avatar.png' }, // Contoh user baru ((belom work demn))
  ]);

  const [messages, setMessages] = useState({
    1: [
      { id: 1, from: 'Denise', text: "You're welcome", timestamp: '2023-11-23T09:38:00Z' },
      { id: 2, from: 'You', text: 'Thanks!', timestamp: '2023-11-23T09:39:00Z' },
    ],
    2: [
      { id: 1, from: 'Bagas', text: 'omagama kiwkiw', timestamp: '2023-11-23T10:00:00Z' },
      { id: 2, from: 'You', text: 'Haha, keren!', timestamp: '2023-11-23T10:01:00Z' },
    ],
    3: [
      { id: 1, from: 'Franklin', text: 'Hi there, Muhammad...', timestamp: '2023-11-20T08:00:00Z' },
      { id: 2, from: 'You', text: 'Hello!', timestamp: '2023-11-20T08:01:00Z' },
    ],
  });

  const chatDetails = {
    1: { name: 'Denise Felicia Tiowanni', avatar: null },
    2: { name: 'Bagas Sambega Rosyadi', avatar: '/bagas_avatar.png' },
    3: { name: 'Franklin Tavarez', avatar: null },
  };

  const handleStartNewChat = (userId: number) => {
    console.log('Starting new chat with user', userId);
    setShowNewMessage(false);
    if (!messages[userId]) {
      setMessages({
        ...messages,
        [userId]: [],
      });
    }
    setSelectedChat(userId); 
  };

  return (
    <div className="flex justify-center items-center min-h-screen mt-10">
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden w-full max-w-4xl h-[90vh]">
        <div className="py-1 px-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-semibold">Messaging</h1>  
          <button
            onClick={() => setShowNewMessage(!showNewMessage)}
            className="p-2 bg-transparent hover:bg-gray-200 rounded-full"
          >
            <img
              src={NewMessage}
              alt="New Message"
              className="w-6 h-6"
            />
          </button>
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
              initialMessages={messages[selectedChat]}
            />
          )}
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
                  onClick={() => handleStartNewChat(user.id)}
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
  );
};

export default Chat;

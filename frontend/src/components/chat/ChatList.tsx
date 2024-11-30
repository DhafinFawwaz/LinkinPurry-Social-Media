import React from 'react';
import { format } from 'date-fns';

const ChatList: React.FC<{
  onSelectChat: (id: number) => void;
  selectedChat: number | null;
  messages: { [key: number]: { id: number; from: string; text: string; timestamp: string }[] };
  chatDetails: { [key: number]: { name: string; avatar: string | null } };
}> = ({ onSelectChat, selectedChat, messages, chatDetails }) => {
  
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const chats = Object.keys(messages).map((chatId) => {
    const chatMessages = messages[parseInt(chatId)];
    const lastMessage = chatMessages[chatMessages.length - 1];
    const details = chatDetails[parseInt(chatId)];
    return {
      id: parseInt(chatId),
      name: details.name,
      avatar: details.avatar,
      lastMessage: truncateText(lastMessage.text, 20),
      timestamp: lastMessage.timestamp,
    };
  });

  return (
    <div className="w-full md:w-1/3 border-r">
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`p-4 border-b cursor-pointer flex items-center ${
              chat.id === selectedChat ? 'bg-blue-50' : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <img
              src={chat.avatar || '/jobseeker_profile.svg'}
              alt={`${chat.name}'s avatar`}
              className="w-10 h-10 rounded-full mr-4"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-semibold">{chat.name}</p>
                <span className="text-sm text-gray-400">
                  {format(new Date(chat.timestamp), 'MMM d')}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;

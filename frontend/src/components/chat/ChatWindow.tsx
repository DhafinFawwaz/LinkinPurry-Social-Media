import React, { useState, useEffect } from 'react';
import { format, isToday } from 'date-fns';

type Message = {
  id: number;
  from: string;
  text: string;
  timestamp: string;
};

type ChatDetails = {
  name: string;
  avatar: string | null;
};

const ChatWindow: React.FC<{ chatDetails: ChatDetails; messages: Message[] }> = ({
  chatDetails,
  messages: initialMessages,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: Date.now(), from: 'You', text: newMessage, timestamp: new Date().toISOString() },
      ]);
      setNewMessage('');
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    }
    return format(date, 'MMMM d, yyyy');
  };

  let lastDate = '';
  return (
    <div className="flex-1 flex flex-col h-[90%]">
      <div className="p-4 border-b flex items-center">
        <h2 className="text-lg font-semibold">{chatDetails.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const currentDate = formatDateHeader(msg.timestamp);
          const showDateHeader = currentDate !== lastDate; // If the date changes
          lastDate = currentDate;

          return (
            <React.Fragment key={msg.id}>
              {showDateHeader && (
                <div className="text-center text-xs text-gray-500 font-semibold mb-2">
                  {currentDate}
                </div>
              )}
              <div className="flex items-start space-x-3">
                <img
                  src={
                    msg.from === 'You'
                      ? '/jobseeker_profile.svg'
                      : chatDetails.avatar || '/jobseeker_profile.svg'
                  }
                  alt={`${msg.from}'s avatar`}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-700">{msg.from}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(msg.timestamp), 'hh:mm a')}
                    </span>
                  </div>
                  <div className="text-base text-gray-900">{msg.text}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="p-4 border-t flex">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2 mr-2"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="bg-blue_primary text-white font-semibold py-2 px-4 rounded-full hover:bg-blue_hover"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

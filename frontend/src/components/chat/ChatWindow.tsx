import React, { useState, useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { ChatMessage, LatestChat, User } from '../../type';
import toImageSrc from '../../utils/image';

export default function ChatWindow({ chatDetails, messages, user, isTyping, children }: { chatDetails: LatestChat; messages: ChatMessage[]; user: User; isTyping: boolean; children: React.ReactNode })
  {

  const scrollViewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(scrollViewRef.current) scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
  }, [messages]);

  const isMessageFromSelf = (msg: ChatMessage) => msg.from_id === Number(user.id);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    }
    return format(date, 'MMMM d, yyyy');
  };

  let lastDate = '';
  return ( 
    <div className="flex-1 flex flex-col border-t">
      <div className="p-4 border-b flex items-center">
        <h2 className="text-lg font-semibold">{chatDetails.full_name}</h2>
      </div>

      <div ref={scrollViewRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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
              {
                isMessageFromSelf(msg) ? 
                <div className="flex items-start space-x-3 justify-end">
                  <div>
                    <div className="flex items-center space-x-2 w-full justify-end">
                      <span className="text-xs text-gray-500">
                        {format(new Date(msg.timestamp), 'hh:mm a')}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{user.full_name}</span>
                    </div>
                    <div className="text-sm text-gray-900 ml-11 text-right break-all">{msg.message}</div>
                  </div>
                  <img
                    src={toImageSrc(user.profile_photo_path)}
                    alt={`My avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                  
                </div>
                :
                <div className="flex items-start space-x-3">
                  <img
                    src={toImageSrc(user.profile_photo_path)}
                    alt={`${chatDetails.full_name}'s avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-700">{chatDetails.full_name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(msg.timestamp), 'hh:mm a')}
                      </span>
                    </div>
                    <div className="text-base text-gray-900 mr-11 break-all">{msg.message}</div>
                  </div>
                </div>
              }
            </React.Fragment>
          );
        })}
        
        {!isTyping ? <></> : 
          <div className="flex items-start space-x-3">
            <img
              src={toImageSrc(user.profile_photo_path)}
              alt={`${chatDetails.full_name}'s avatar`}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-700">{chatDetails.full_name}</span>
                <span className="text-xs text-gray-500">
                </span>
              </div>
              <div className="text-base text-gray-900 mr-11">
                  <div className="typingIndicatorBubble -translate-x-1.5 w-8 h-6">
                    <div className="typingIndicatorBubbleDot"></div>
                    <div className="typingIndicatorBubbleDot"></div>
                    <div className="typingIndicatorBubbleDot"></div>
                  </div>
              </div>
            </div>
          </div>
        }
        
      </div>

      <div className="p-4 border-t flex bottom-0 mb-12 sm:mb-0 w-full z-20 bg-white">
        { children }
      </div>
    </div>
  );
};


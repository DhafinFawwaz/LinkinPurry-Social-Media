import { format } from 'date-fns';
import { ChatMessage, LatestChat } from '../../type';
import { Link } from 'react-router-dom';
import toImageSrc from '../../utils/image';

export default function ChatList({ chat, selectedChatId, to } : { chat: LatestChat, selectedChatId: number, to: string}) {

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    
        <Link to={to}
          className={`p-4 border-b cursor-pointer flex items-center text-black ${
            chat.other_user_id === selectedChatId ? 'bg-blue-50' : 'hover:bg-gray-100'
          }`}
        >
          <img
            src={toImageSrc(chat.profile_photo_path) || '/jobseeker_profile.svg'}
            alt={`${chat.full_name}'s avatar`}
            className="w-10 h-10 rounded-full mr-4"
          />
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-semibold">{chat.full_name}</p>
              <span className="text-sm text-gray-400">
                {format(new Date(chat.timestamp), 'MMM d')}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{truncateText(chat.message, 20)}</p>
          </div>
        </Link>
  );
};


import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: {
    _id: string;
    message: string;
    message_type?: string;
    media_url?: string;
    sender_id: {
      _id: string;
      name: string;
      profileImage?: string;
      role?: string;
    };
    createdAt: string;
  };
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, showAvatar = true }) => {
  const isImage = message.message_type === 'image' && message.media_url;

  return (
    <div className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwnMessage && showAvatar && (
        <div className="flex-shrink-0 mr-3 mt-auto mb-1">
          <img 
            src={message.sender_id?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${message.sender_id?.name}`}
            alt={message.sender_id?.name}
            className="w-8 h-8 rounded-full object-cover border border-[#2d3748]"
          />
        </div>
      )}
      
      {!isOwnMessage && !showAvatar && <div className="w-11" />} {}

      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {!isOwnMessage && showAvatar && (
          <span className="text-xs text-gray-400 mb-1 ml-1 flex items-center gap-2">
            {message.sender_id?.name}
            {message.sender_id?.role === 'organizer' && (
              <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded">Host</span>
            )}
          </span>
        )}
        
        <div 
          className={`px-4 py-2.5 rounded-2xl relative ${
            isOwnMessage 
              ? 'bg-[#1a202c] border border-[#2d3748] text-white rounded-tr-sm' 
              : 'bg-[#ff6b35] text-white rounded-tl-sm'
          } ${isImage ? 'p-2 bg-transparent border-none' : ''}`}
        >
          {isImage ? (
            <div className="flex flex-col gap-2">
              <img 
                src={message.media_url} 
                alt="Attachment" 
                className="max-w-full max-h-60 rounded-xl object-contain cursor-pointer hover:opacity-90 transition-opacity bg-black/20"
                onClick={() => window.open(message.media_url, '_blank')}
              />
              {message.message && <p className="text-[15px] leading-relaxed break-words px-2 pb-1">{message.message}</p>}
            </div>
          ) : (
            <p className="text-[15px] leading-relaxed break-words">{message.message}</p>
          )}
        </div>
        
        <span className="text-[10px] text-gray-500 mt-1 mx-1">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

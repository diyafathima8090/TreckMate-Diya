import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Users, Info, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';

interface ChatLayoutProps {
  singleRoomId?: string | null;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ singleRoomId }) => {
  const { sessions, activeRole } = useAuth();
  const user = sessions[activeRole];
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(!singleRoomId);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize rooms
  useEffect(() => {
    if (singleRoomId) {
      // Single room mode, we don't fetch all rooms
      setLoadingRooms(false);
      
      const fetchRoom = async () => {
        try {
          const res = await axios.get(`/chat/trip/${singleRoomId}/room`);
          if (res.data.success) {
            setRooms([res.data.room]);
            setActiveRoomId(res.data.room._id);
            setAuthError(null);
          }
        } catch (error: any) {
          if (error.response?.status === 403) {
            setAuthError(error.response.data.message || 'You do not have access to this chat.');
          } else {
            console.error(error);
          }
        }
      }
      fetchRoom();
      return;
    }

    const fetchRooms = async () => {
      try {
        const res = await axios.get(`/chat/rooms`);
        if (res.data.success) {
          setRooms(res.data.data);
          if (res.data.data.length > 0) {
            setActiveRoomId(res.data.data[0]._id);
          }
          setAuthError(null);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          setAuthError(error.response.data.message || 'You do not have access to these chats.');
        } else {
          console.error('Failed to load chat rooms', error);
        }
      } finally {
        setLoadingRooms(false);
      }
    };
    if (user) fetchRooms();
  }, [user, singleRoomId]);

  // Fetch messages when room changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeRoomId) return;
      setLoadingMessages(true);
      try {
        const res = await axios.get(`/chat/room/${activeRoomId}/messages`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeRoomId]);

  // Socket connection
  useEffect(() => {
    if (!activeRoomId || !user) return;

    const token = sessionStorage.getItem('trekmate_token');
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', { roomId: activeRoomId });
    });

    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
      newSocket.emit('read_receipt', { roomId: activeRoomId, messageId: message._id });
    });

    newSocket.on('user_typing', ({ userId, name, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(name)) return [...prev, name];
        if (!isTyping) return prev.filter((n) => n !== name);
        return prev;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [activeRoomId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSendMessage = (text: string, type = 'text', mediaUrl = '') => {
    if (!socket || !activeRoomId) return;
    socket.emit('send_message', { roomId: activeRoomId, message: text, type, media_url: mediaUrl });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !activeRoomId) return;
    socket.emit('typing', { roomId: activeRoomId, isTyping });
  };

  const activeRoom = rooms.find(r => r._id === activeRoomId);

  return (
    <div className={`flex ${singleRoomId ? 'h-full min-h-[360px]' : 'h-[600px]'} bg-[#070708] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl`}>
      {/* Sidebar - Hide in single room mode */}
      {!singleRoomId && (
        <div className="w-72 bg-[#0a0f16] border-r border-[#1f2937] flex flex-col hidden md:flex">
          <div className="p-4 border-b border-[#1f2937] bg-[#0f172a]">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#ff6b35]" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingRooms ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-gray-500 animate-spin" /></div>
            ) : rooms.map(room => (
              <button
                key={room._id}
                onClick={() => setActiveRoomId(room._id)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeRoomId === room._id ? 'bg-[#ff6b35]/10 text-white' : 'text-gray-400 hover:bg-[#1a202c] hover:text-gray-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {room.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] truncate">{room.name}</div>
                  {room.lastMessage && (
                    <div className="text-[11px] text-gray-500 truncate mt-0.5">{room.lastMessage.text}</div>
                  )}
                </div>
              </button>
            ))}
            {!loadingRooms && rooms.length === 0 && (
              <div className="text-center p-4 text-gray-500 text-sm">No active chats</div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070708]">
        {authError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Access Denied</h3>
            <p className="max-w-xs">{authError}</p>
          </div>
        ) : activeRoom ? (
          <>
            <div className="flex items-center justify-between p-4 bg-[#0f172a] border-b border-[#1f2937]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff6b35] to-[#ff983f] flex items-center justify-center text-white font-bold text-lg">
                  {activeRoom.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-white font-semibold text-[15px]">{activeRoom.name}</h2>
                  <p className="text-xs text-[#a0aec0] flex items-center gap-1">
                    <Users className="w-3 h-3" /> Group Chat
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingMessages ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 text-[#ff6b35] animate-spin" /></div>
              ) : messages.map((msg, idx) => {
                const isOwn = msg.sender_id?._id === user._id;
                const showAvatar = !isOwn && (idx === 0 || messages[idx - 1].sender_id?._id !== msg.sender_id?._id);
                return (
                  <MessageBubble 
                    key={msg._id} 
                    message={msg} 
                    isOwnMessage={isOwn} 
                    showAvatar={showAvatar}
                  />
                );
              })}
              
              {typingUsers.length > 0 && (
                <div className="text-xs text-gray-500 italic ml-12">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

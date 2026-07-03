import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import axios from '../../utils/axios';

interface ChatInputProps {
  onSendMessage: (message: string, type?: string, mediaUrl?: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Typing indicator logic
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.imageUrl) {
        onSendMessage('', 'image', res.data.imageUrl);
      }
    } catch (err) {
      console.error('File upload failed', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text', '');
      setMessage('');
      setShowEmojiPicker(false);
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="relative">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50 shadow-2xl">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 bg-[#0a0f16] border-t border-[#1f2937]">
        <div className="flex items-center gap-2 bg-[#131a23] p-2 rounded-full border border-[#2d3748] focus-within:border-[#ff6b35] transition-colors relative">

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 transition-colors ${showEmojiPicker ? 'text-[#ff6b35]' : 'text-gray-400 hover:text-white'}`}
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={uploading}
          >
            <Paperclip className={`w-5 h-5 ${uploading ? 'animate-pulse text-[#ff6b35]' : ''}`} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder={uploading ? "Uploading image..." : "Type a message..."}
            disabled={uploading}
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none px-2 py-1"
          />

          <button
            type="submit"
            disabled={!message.trim() || uploading}
            className={`p-2 rounded-full flex items-center justify-center transition-all ${message.trim()
                ? 'bg-[#ff6b35] text-white hover:bg-[#e85b25] scale-100'
                : 'bg-[#2d3748] text-gray-500 scale-95'
              }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';

export default function Chat({ onClose }) {
  const { user } = useAuth();
  const { messages, sendChatMessage } = useRoom();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed right-4 bottom-20 w-80 h-96 bg-gray-900 rounded-2xl border border-white/10 shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.senderId === user._id ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.senderId !== user._id && (
                  <span className="text-xs text-gray-400">{msg.senderName}</span>
                )}
                <span className="text-xs text-gray-600">{formatTime(msg.timestamp)}</span>
              </div>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.senderId === user._id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import type { Community, ChatMessage } from '../types/community';
import { useUser } from '@/shared/hooks/useUser';
import toast from 'react-hot-toast';

export default function ChatTab({ community, communityId }: { community: Community; communityId: string }) {
  const user = useUser() ?? {};
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [communityId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadMessages = async () => {
    try { const res = await communityApi.getChat(communityId); setMessages(res.data); }
    catch { /* ignore */ }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await communityApi.sendChat(communityId, input);
      setMessages(prev => [...prev, res.data]);
      setInput('');
    } catch { toast.error('Failed to send'); }
    setSending(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl flex flex-col h-[420px] sm:h-[500px]">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <MessageCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.user_id === user.id;
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 sm:px-4 py-2 break-words ${isOwn ? 'bg-primary-500/20 border border-primary-500/30 text-white' : 'bg-white/5 border border-white/10 text-white/80'}`}>
                  {!isOwn && <p className="text-[10px] font-semibold text-primary-400 mb-0.5">{msg.user_name}</p>}
                  <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                  <p className="text-[10px] text-white/30 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t border-white/10 p-2.5 sm:p-3">
        <form onSubmit={send} className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
            className="flex-1 min-w-0 px-3.5 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
          <button type="submit" disabled={sending || !input.trim()}
            className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-50 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

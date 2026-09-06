import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import { useReports } from '@/lib/hooks';
import { api } from '@/lib/api';
import { Card } from '@/components/ui';
import type { ReportWithRelations } from '@/lib/types';

interface ChatMessage { role: 'user' | 'assistant'; content: string }

export function AIChatWidget() {
  const { reports } = useReports();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your AI assistant. Ask me about team blockers, meeting hours, or request an executive summary." }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    const currentInput = input;
    setInput('');

    // Add loading placeholder
    setMessages((m) => [...m, { role: 'assistant', content: 'Thinking...' }]);

    try {
      const response = await api.chatWithAI(currentInput);
      setMessages((m) => {
        const newM = [...m];
        newM[newM.length - 1] = { role: 'assistant', content: response.data?.answer || response.data || 'Empty response' };
        return newM;
      });
    } catch (e: any) {
      console.error(e);
      setMessages((m) => {
        const newM = [...m];
        newM[newM.length - 1] = { role: 'assistant', content: `Error: ${e.message || 'Failed to communicate with AI'}` };
        return newM;
      });
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 hover:bg-blue-700 transition-all">
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-medium">AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="flex flex-col h-[500px] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-2 text-white">
            <Bot className="w-5 h-5" />
            <span className="font-medium text-sm">AI Assistant</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about blockers, hours, summaries..." className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSend} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Send className="w-4 h-4" /></button>
        </div>
      </Card>
    </div>
  );
}

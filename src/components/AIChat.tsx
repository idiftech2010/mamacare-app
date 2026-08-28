import { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { API_BASE_URL } from '@/lib/api';

export default function AIChat() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'model', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I cannot process your request at this time. Please try again.' }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I cannot process your request at this time. Please try again.' }]);
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b bg-mamacare-coral text-white font-bold flex items-center gap-2">
        <Bot size={20} /> MamaCare Advisor
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-mamacare-coral text-white' : 'bg-gray-100'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-100 animate-pulse">
              Typing...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t flex gap-2">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask anything..." 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
        />
        <Button onClick={handleSend} disabled={isLoading}>
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
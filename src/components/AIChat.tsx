import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'https://mamacare-backend-n1z7.onrender.com/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const suggestedQuestions = [
  'What are warning signs I should watch for?',
  'How much weight should I gain?',
  'What foods should I avoid?',
  'Is it safe to exercise during pregnancy?',
];

export default function AIChat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm MamaCare AI, your maternal health assistant. I'm here to answer your questions about pregnancy, nutrition, symptoms, and more. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (questionText?: string) => {
    const finalText = questionText || inputText.trim();

    if (!finalText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: finalText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: finalText }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'I apologize, but I cannot provide a response at this time. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        toast.error('Failed to get response from AI');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I apologize, but I cannot process your request at this time. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Network error. Please check your connection.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I cannot process your request at this time. Please ensure you have a stable internet connection and try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-400 to-pink-400 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">MamaCare AI</h1>
            <p className="text-red-50 text-sm">Always here for you</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 1 && (
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-gray-600">Suggested questions:</p>
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-red-700 text-sm font-medium"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-red-400 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <p className="break-words text-sm">{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'user'
                    ? 'text-red-100'
                    : 'text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
              <span className="text-sm text-gray-600">MamaCare AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me anything about your pregnancy..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1 border-gray-300 focus:border-red-400 focus:ring-red-200"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="bg-red-400 hover:bg-red-500 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Not a substitute for professional medical advice. Always consult with your healthcare provider.
        </p>
      </div>
    </div>
  );
}

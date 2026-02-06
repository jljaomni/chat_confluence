import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// Definimos los tipos para nuestros mensajes
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

// Definimos la interfaz de la respuesta de tu webhook
interface WebhookResponse {
  output: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post<WebhookResponse>(webhookUrl, { 
        message: input 
      }, { 
        timeout: 30000000
      });

      const botReply: Message = { 
        text: response.data.output || "No recibí respuesta.", 
        sender: 'bot' 
      };
      
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { text: 'Error de conexión con Jira.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f9f9f9] text-[#202124] font-sans overflow-hidden">
      
      {/* Header Estilo Gemini */}
      <div className="mt-16 mb-6 text-center animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl font-medium tracking-tight text-[#1f1f1f]">
          Hello! <span className="text-[#747775]">How can I assist you today?</span>
        </h1>
      </div>

      {/* Contenedor de Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 w-full max-w-3xl mx-auto space-y-6 pb-44">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-full px-6 py-3 rounded-[2rem] text-[15px] leading-relaxed shadow-sm ${
              msg.sender === 'user' 
              ? 'bg-[#f0f4f9] text-[#1f1f1f]' 
              : 'bg-white border border-[#e3e3e3] text-[#3c4043]'
            }`}>
              <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start items-center space-x-2 ml-4">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de entrada flotante */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pt-10 pb-10 px-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white rounded-[2rem] shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-[#e3e3e3] p-2 flex items-center focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all">
            
            <button className="p-3 text-[#444746] hover:bg-gray-100 rounded-full transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>

            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-base md:text-lg px-2 text-[#1f1f1f] placeholder-[#747775]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              disabled={isLoading}
            />

            <div className="flex items-center gap-1 pr-2">
              <button className="hidden md:block p-3 text-[#444746] hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v5a3 3 0 01-3 3 3 3 0 01-3-3V5a3 3 0 013-3z" /></svg>
              </button>
              
              <button 
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className={`p-3 rounded-full transition-all active:scale-90 ${
                  input.trim() ? 'bg-[#f0f4f9] text-[#1f1f1f] hover:bg-[#e1e9f5]' : 'text-gray-300'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[12px] text-[#747775] mt-4 font-normal">
            Confluence Bot can provide detailed info on Confluence pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
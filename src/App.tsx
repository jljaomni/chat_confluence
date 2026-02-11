import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Login from './Login';

const ADMIN_PASSWORD = '*6J^o!kqIXsK^oK#';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

// Actualizamos la interfaz para el envío
interface WebhookPayload {
  message: string;
  space: string;
}

const Chat: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [space, setSpace] = useState<string>('INFRAD'); // Valor por defecto
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;

  useEffect(() => {
    const auth = localStorage.getItem('isLoggedIn');
    if (auth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Enviamos el mensaje junto con el espacio seleccionado
      const response = await axios.post(webhookUrl, { 
        message: input,
        space: space 
      } as WebhookPayload, { timeout: 300000 });

      const botReply: Message = { 
        text: response.data.output || "No recibí respuesta.", 
        sender: 'bot' 
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: 'Error al conectar con Jira.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f9f9f9] text-[#202124] font-sans overflow-hidden">
      {/* Header with Logout */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-[#e3e3e3]">
        <div className="font-bold text-[#1f1f1f]">Confluence Omni Chat</div>
        <button 
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium rounded-full transition duration-300 bg-red-100 hover:bg-red-200 px-3 py-1"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 w-full max-w-3xl mx-auto space-y-6 pb-44 pt-10">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-6 py-3 rounded-[2rem] shadow-sm ${
              msg.sender === 'user' ? 'bg-[#f0f4f9] text-[#1f1f1f]' : 'bg-white border border-[#e3e3e3]'
            }`}>
              {msg.sender === 'bot' ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-400 text-sm italic ml-4">Procesando en {space}...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Input con Dropdown Integrado */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#f9f9f9] to-transparent pb-10 px-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white rounded-[2.5rem] shadow-lg border border-[#e3e3e3] p-1.5 flex items-center">
            
            {/* Dropdown de Espacio */}
            <div className="relative ml-2">
              <select 
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="appearance-none bg-[#f0f4f9] hover:bg-[#e1e9f5] text-[#1f1f1f] text-xs font-bold py-2 pl-4 pr-8 rounded-full border-none focus:ring-2 focus:ring-blue-200 cursor-pointer transition-colors"
              >
                <option value="INFRAD">INFRAD</option>
                <option value="OMNIPRO">OMNIPRO</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-base px-4 placeholder-[#747775]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Ask ${space}...`}
              disabled={isLoading}
            />

            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-[#1f1f1f] text-white rounded-full hover:bg-slate-700 transition disabled:opacity-20 mr-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

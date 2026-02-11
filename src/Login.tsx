import React, { useState } from 'react';

interface LoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f9f9f9] text-[#202124] font-sans overflow-hidden items-center justify-center">
      <div className="w-full max-w-md px-6 py-8 bg-white rounded-[2.5rem] shadow-lg border border-[#e3e3e3] mx-4">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#1f1f1f]">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              className="w-full bg-[#f0f4f9] border-none outline-none focus:ring-2 focus:ring-blue-200 text-base px-6 py-3 rounded-full placeholder-[#747775] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm ml-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full p-3 bg-[#1f1f1f] text-white rounded-full hover:bg-slate-700 transition font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await login(formData.email, formData.password);
      } else {
        res = await signup(formData);
      }

      if (res.success) {
        onClose();
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex bg-[#f8faf8] border-b border-[#bfcab9]/30">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-4 font-bold text-center transition-colors ${isLogin ? 'text-[#186a22] border-b-2 border-[#186a22]' : 'text-[#6f7a6b] hover:text-[#191c1b]'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-4 font-bold text-center transition-colors ${!isLogin ? 'text-[#186a22] border-b-2 border-[#186a22]' : 'text-[#6f7a6b] hover:text-[#191c1b]'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold font-headline text-[#191c1b] mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Join KesaanConnect'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-[#3f4a3d] mb-1 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-[#bfcab9] rounded-xl px-4 py-3 bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30 transition-all"
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-[#3f4a3d] mb-1 block">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-[#bfcab9] rounded-xl px-4 py-3 bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30 transition-all"
                placeholder="farmer@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#3f4a3d] mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-[#bfcab9] rounded-xl px-4 py-3 bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30 transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-[#3f4a3d] mb-1 block">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-[#bfcab9] rounded-xl px-4 py-3 bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30 transition-all"
                >
                  <option value="user">Farmer (User)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#186a22] focus:ring-[#186a22]" />
                  <span className="text-[#3f4a3d]">Remember me</span>
                </label>
                <a href="#" className="text-[#186a22] font-semibold hover:underline">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#186a22] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#005312] active:scale-[0.98] transition-all disabled:opacity-70 mt-2 shadow-lg shadow-[#186a22]/20"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-[#3f4a3d] transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

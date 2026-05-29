import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Store admin token if provided
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
      }

      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Redirect to admin dashboard
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent rounded-3xl blur-2xl" />

        <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[#d4af37]/30 rounded-full blur-lg animate-pulse" />
                <div className="relative bg-[#d4af37] rounded-full p-3">
                  <LogIn size={32} className="text-black" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-gray-400 text-sm">Access the GospelScreen TV administration dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4">
              <p className="text-green-400 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gospelscreen.tv"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white placeholder-gray-500 focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer accent-[#d4af37]"
              />
              <label htmlFor="remember" className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#e5c158] text-black font-bold py-3.5 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:from-[#e5c158] hover:to-[#f0d661] transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Login to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Forgot your password?{' '}
              <a href="/forgot-password" className="text-[#d4af37] hover:text-[#e5c158] transition-colors font-medium">
                Reset it here
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              © 2026 GospelScreen TV. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

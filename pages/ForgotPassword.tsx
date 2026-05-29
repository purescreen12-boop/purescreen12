import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavBar from '../components/MobileNavBar';
import { Mail, CheckCircle2, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!email) throw new Error("Email is required.");

      // Update the URL to your Node.js backend endpoint (port 8081)
      console.log('Sending forgot password request for email:', email);
      const response = await fetch('http://localhost:8081/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      // Backend returns JSON
      const data = await response.json();
      console.log('Forgot password response:', data);
      // The backend always returns a success message for security reasons
      setSuccess(data.message);

    } catch (err: any) {
      console.error('Forgot password error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please make sure the backend is running on port 8081.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Password reset is handled on the emailed reset page; this component only requests the reset link.

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Cinematic background image (shared with Auth) */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat transition-transform duration-1000 z-0"
        style={{ backgroundImage: `url('/wet-monstera-deliciosa-plant-leaves-garden.jpg')`, backgroundPosition: '40% 50%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-10" />

      <div className="max-w-md w-full z-20">
        <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-30">

          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Forgot Password
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-[#d4af37] hover:underline text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-600">
            <CheckCircle2 size={16} className="text-[#d4af37] shrink-0" />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed">
              Safe & Secure Password Recovery for all PureScreen users.
            </p>
          </div>
        </div>
      </div>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
};

export default ForgotPassword;
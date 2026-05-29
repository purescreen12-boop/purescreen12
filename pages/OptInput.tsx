import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';

const OptInput: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timerCount, setTimer] = useState(60);
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const email = searchParams.get('email') || '';

  const inputRefs = Array(6).fill(0).map(() => React.createRef<HTMLInputElement>());

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [disable]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const resendOTP = async () => {
    if (disable) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8081/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSuccess('A new OTP has been sent to your email.');
      setDisable(true);
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8081/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Navigate to reset password with token
      navigate(`/reset-password?reset=${data.resetToken}`);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">

          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Email Verification
            </h1>
            <p className="text-gray-500 text-sm">
              We have sent a 6-digit code to your email {email}
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

          <div className="space-y-8">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all text-white placeholder:text-gray-600"
                  placeholder="0"
                />
              ))}
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading || otp.some(digit => !digit)}
              className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Verify Code
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">Didn't receive the code?</p>
              <button
                onClick={resendOTP}
                disabled={disable || loading}
                className={`flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  disable
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-[#d4af37] hover:underline cursor-pointer'
                }`}
              >
                <RotateCcw size={16} />
                {disable ? `Resend in ${timerCount}s` : 'Resend Code'}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-[#d4af37] hover:underline text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Forgot Password
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4 text-gray-600">
            <CheckCircle2 size={16} className="text-[#d4af37] shrink-0" />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed">
              Secure OTP Verification for all GospelScreen users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptInput;

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import MobileNavBar from '../components/MobileNavBar';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Using a ref to prevent state updates on unmounted component
  const isMounted = useRef(true);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Set up mount/unmount tracking
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided. Please request a new password reset.');
        setVerifying(false);
        return;
      }

      try {
        console.log('Verifying reset token...');
        const response = await fetch('http://localhost:8081/api/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log('Token verification response:', data);

        if (!isMounted.current) return;

        if (!response.ok || !data.valid) {
          setError(data.error || 'Invalid or expired reset link.');
          setTokenValid(false);
        } else {
          setTokenValid(true);
          // Safely access user details using optional chaining
          setUserEmail(data.user?.email || '');
          setUserName(data.user?.name || '');
          setError(null);
        }
      } catch (err: any) {
        console.error('Token verification error:', err);
        if (isMounted.current) {
          setError(err.message || 'Failed to verify reset link. Please try again.');
          setTokenValid(false);
        }
      } finally {
        if (isMounted.current) {
          setVerifying(false);
        }
      }
    };

    verifyToken();
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  }, [newPassword]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength === 0) return 'bg-gray-600';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validation
      if (!newPassword) throw new Error('Please enter a new password.');
      if (newPassword.length < 8) throw new Error('Password must be at least 8 characters long.');
      if (newPassword !== confirmPassword) throw new Error('Passwords do not match.');
      if (passwordStrength < 3) throw new Error('Password is not strong enough. Please use a stronger password.');
      if (!token) throw new Error('Reset token is missing.');

      console.log('Submitting password reset...');
      const response = await fetch('http://localhost:8081/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();
      console.log('Reset password response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      if (isMounted.current) {
        setSuccess(data.message || 'Password reset successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }

      // Redirect to login after 3 seconds safely
      setTimeout(() => {
        if (isMounted.current) {
          navigate('/auth');
        }
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (isMounted.current) {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full z-10">
          <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="animate-spin w-12 h-12 border-4 border-gray-600 border-t-[#d4af37] rounded-full mx-auto" />
              <p className="text-gray-400">Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
      {/* Cinematic background image */}
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
              Reset Password
            </h1>
            <p className="text-gray-500 text-sm">
              {tokenValid ? `Create a new password for ${userEmail}` : 'Reset flow status'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <div>
                <p>{error}</p>
                {!tokenValid && (
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="mt-3 text-red-300 hover:text-red-200 underline text-xs"
                  >
                    Request a new reset link
                  </button>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-semibold">Success!</p>
                <p>{success}</p>
                <p className="text-xs text-green-300 mt-2">Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Keep the form rendered even when successful to avoid abrupt structural layout breaking */}
          {tokenValid && (
            <form onSubmit={handleResetPassword} className={`space-y-5 ${success ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={!!success}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-10 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    disabled={!!success}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-770 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{getPasswordStrengthText()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={!!success}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-10 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]/50 outline-none transition-all placeholder:text-gray-700"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    disabled={!!success}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 ml-1">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || !!success}
                className="w-full bg-yellow-500 py-3.5 rounded-xl font-semibold text-black transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-20 border-yellow border-t-transparent rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-1 mt-6"
              >
                <ArrowLeft size={14} />
                Back to Login
              </button>
            </form>
          )}

          {!tokenValid && !success && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="gradient-golden px-6 py-2.5 rounded-lg font-semibold text-black inline-flex items-center gap-2 hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all"
              >
                <ArrowLeft size={16} />
                Request New Link
              </button>
            </div>
          )}
        </div>
      </div>
      <MobileNavBar showNav={true} isAlwaysVisible={true} />
    </div>
  );
};

export default ResetPassword;
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import {
  X,
  Mail,
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const {
    isConfigured,
    openSignIn,
    sendEmailOtp,
    verifyEmailOtp,
    sendMobileOtp,
    verifyMobileOtp
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMethod === 'email') {
        const res = await sendEmailOtp(identifier);
        if (res.success) {
          setOtpSent(true);
          setResendTimer(60);
          setSuccessMsg(res.message);
        } else {
          setError(res.message);
        }
      } else {
        const res = await sendMobileOtp(identifier);
        if (res.success) {
          setOtpSent(true);
          setResendTimer(60);
          setSuccessMsg(res.message);
        } else {
          setError(res.message);
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMethod === 'email') {
        const res = await verifyEmailOtp(identifier, otp);
        if (res.success) {
          onClose();
        } else {
          setError(res.message);
        }
      } else {
        const res = await verifyMobileOtp(identifier, otp);
        if (res.success) {
          onClose();
        } else {
          setError(res.message);
        }
      }
    } catch {
      setError('Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FCFBF7] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#EAE3D9] relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#786C63] hover:text-[#231B15] hover:bg-[#F6F1EC] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Luxury Brand Banner */}
        <div className="bg-gradient-to-b from-[#F6F1EC] to-[#FCFBF7] p-6 text-center border-b border-[#EAE3D9]">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#EAE3D9] shadow-md mx-auto mb-3 bg-white">
            <Image
              src="/images/logo.jpeg"
              alt="Live Love Light Logo"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-[#231B15]">
            Live Love Light
          </h3>
          <p className="text-xs text-[#786C63] mt-1 font-medium tracking-wide">
            LIGHT SOMETHING BEAUTIFUL
          </p>
        </div>

        <div className="p-6">
          {/* Clerk Live Authentication Trigger */}
          <button
            type="button"
            onClick={() => {
              onClose();
              openSignIn();
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-5"
          >
            <Lock className="w-4 h-4 text-[#DFBE58]" />
            <span>Continue with Clerk (Email OTP / SMS)</span>
            <ArrowRight className="w-4 h-4 text-[#DFBE58]" />
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-[#EAE3D9]"></div>
            <span className="shrink-0 mx-3 text-[10px] text-[#786C63] uppercase tracking-wider font-semibold">Or use direct form</span>
            <div className="flex-grow border-t border-[#EAE3D9]"></div>
          </div>

          {/* Method Selector: Email OTP vs Mobile OTP */}
          {!otpSent && (
            <div className="flex rounded-lg bg-[#F6F1EC] p-1 mb-5 border border-[#EAE3D9]">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setIdentifier('');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-[#231B15] shadow-xs'
                    : 'text-[#786C63] hover:text-[#231B15]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setIdentifier('');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMethod === 'phone'
                    ? 'bg-white text-[#231B15] shadow-xs'
                    : 'text-[#786C63] hover:text-[#231B15]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                Mobile OTP
              </button>
            </div>
          )}

          {/* Provider status warning banner if unconfigured */}
          {!isConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">Live Auth Provider Not Configured</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Firebase credentials are required in <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">.env.local</code> for real SMS & email OTP dispatch. Per project rules, fake OTP verification is prevented in production.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error & Success Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Step 1: Request OTP */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1.5 uppercase tracking-wider">
                  {authMethod === 'email' ? 'Email Address' : 'Mobile Number (10 digits)'}
                </label>
                <div className="relative">
                  {authMethod === 'email' ? (
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#786C63] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white text-sm text-[#231B15] placeholder-[#786C63] pl-10 pr-3 py-2.5 rounded-lg border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]"
                      />
                    </div>
                  ) : (
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#EAE3D9] bg-[#F6F1EC] text-xs font-medium text-[#786C63]">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full bg-white text-sm text-[#231B15] placeholder-[#786C63] px-3 py-2.5 rounded-r-lg border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Request One-Time Password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form Step 2: Verify OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#231B15] uppercase tracking-wider">
                    Enter 6-Digit Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="text-[11px] text-[#C59B27] hover:underline"
                  >
                    Change {authMethod}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#786C63] absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-lg tracking-[0.5em] font-mono bg-white text-[#231B15] pl-10 pr-3 py-2.5 rounded-lg border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#C59B27] hover:bg-[#9A7513] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="text-center pt-2">
                {resendTimer > 0 ? (
                  <p className="text-xs text-[#786C63]">
                    Resend code available in <span className="font-semibold text-[#231B15]">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-[#9A7513] font-semibold hover:underline"
                  >
                    Resend One-Time Password
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

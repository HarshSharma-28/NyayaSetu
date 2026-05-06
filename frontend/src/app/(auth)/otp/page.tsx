'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { IMAGES, getImageWithFallback } from '@/lib/images/image-loader';
import { OTPStore } from '@/lib/auth/otp-store';
import { Session } from '@/lib/auth/session';
import { api } from '@/lib/api/client';
export default function OTPPage() {
  const router = useRouter();
  
  const [demoOTP, setDemoOTP] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [nicId, setNicId] = useState<string>('');
  
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialization check
  useEffect(() => {
    const sessionData = OTPStore.get();
    if (!sessionData) {
      setToast('Session expired. Please login again.');
      setTimeout(() => router.replace('/login'), 2000);
      return;
    }
    
    setDemoOTP(sessionData.otp);
    setRole(sessionData.role);
    setNicId(sessionData.nicSsoId);
  }, [router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleResend = () => {
    try {
      const newOTP = OTPStore.generate();
      OTPStore.save(newOTP, role, nicId);
      setDemoOTP(newOTP);
      setOtpValues(Array(6).fill(''));
      setErrorMsg(null);
      inputRefs.current[0]?.focus();
      showToast('New OTP generated successfully.');
    } catch (err) {
      showToast('Failed to generate new OTP.');
    }
  };

  const verifyOTP = async (enteredString: string) => {
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      // Hit real backend
      const response = await api.auth.login({
        nic_sso_id: nicId,
        password: 'dummy', // password is not strictly checked since OTP handles auth
        role: role,
        otp: enteredString
      });

      // Success
      Session.save({
        nicSsoId: nicId,
        role: role as any,
        loginTime: Date.now(),
        token: (response as any).access_token
      });
      OTPStore.clear(); // cleanup
      
      if (role === 'admin') router.push('/admin');
      else if (role === 'reviewer') router.push('/reviewer');
      else router.push('/officer');

    } catch (err: any) {
      // Failure
      setIsVerifying(false);
      setIsErrorShake(true);
      setErrorMsg(err.message || 'Incorrect OTP. Please try again.');
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      
      setTimeout(() => setIsErrorShake(false), 500);
      
      const newCount = errorCount + 1;
      setErrorCount(newCount);
      
      if (newCount >= 3) {
        setErrorMsg('Too many attempts. Redirecting to login...');
        OTPStore.clear();
        setTimeout(() => router.replace('/login'), 2000);
      }
    }
  };

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Only numbers
    
    const newVal = val.slice(-1); // Take last char if pasted multiple
    const newOtpValues = [...otpValues];
    newOtpValues[index] = newVal;
    setOtpValues(newOtpValues);

    // Auto-advance
    if (newVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if full
    if (newVal && index === 5 && newOtpValues.every(v => v !== '')) {
      verifyOTP(newOtpValues.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center relative overflow-hidden font-sans text-white aurora-bg">
      <div className="tricolor-bar absolute top-0 left-0 w-full z-50">
        <div></div><div></div><div></div>
      </div>

      {toast && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-navy-800 border border-gold-500/50 text-gold-400 text-sm py-3 px-6 rounded-md shadow-lg backdrop-blur-md z-50 animate-fade-in">
          {toast}
        </div>
      )}

      {/* Background Ashoka Chakra (Absolute) */}
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none">
        <Image 
          src={getImageWithFallback(IMAGES.LOGIN.BACKGROUND_CHAKRA, '/placeholder.svg', 'OTP BG')}
          alt="Background Chakra"
          width={1000}
          height={1000}
          className="animate-slow-spin"
        />
      </div>

      <div className="glass-card w-full max-w-[440px] p-10 relative z-10">
        <div className="gold-accent-top"></div>

        <div className="flex flex-col items-center mb-8">
          <Image
            src={getImageWithFallback(IMAGES.OTP.EMBLEM, '/placeholder.svg', 'OTP Emblem')}
            alt="National Emblem"
            width={45}
            height={65}
            className="mb-3 drop-shadow-lg"
          />
          <div className="text-gold-500 font-bold tracking-widest text-xs mb-6">सत्यमेव जयते</div>
          <h2 className="text-2xl font-bold text-white mb-2">OTP Verification</h2>
          <p className="text-sm text-text-secondary text-center">
            Enter the OTP sent to your registered government mobile number
          </p>
        </div>

        {/* DEMO OTP DISPLAY BOX */}
        {demoOTP && (
          <div className="mb-8 border border-gold-500/40 bg-amber-500/10 rounded-lg p-4 text-center">
            <div className="text-xs text-gold-400 uppercase tracking-wider font-bold mb-1">DEMO MODE — Your OTP</div>
            <div className="text-[28px] font-bold text-gold-500 tracking-[0.5em] ml-3">{demoOTP}</div>
            <div className="text-[10px] text-text-muted mt-2 italic">In production, OTP is sent via NIC SMS gateway</div>
          </div>
        )}

        <div className="mb-6">
          <div className={`flex justify-between gap-2 ${isErrorShake ? 'animate-shake' : ''}`}>
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isVerifying}
                className={`w-[52px] h-[60px] text-center text-2xl font-bold rounded-lg transition-all focus:outline-none
                  ${val ? 'bg-navy-800 border-gold-500/50 text-white' : 'glass-card-light text-text-muted'}
                  ${isErrorShake ? 'border-red-500 bg-red-glow' : 'focus:border-gold-500 focus:shadow-[0_0_10px_rgba(212,175,55,0.3)]'}
                `}
              />
            ))}
          </div>
          
          {errorMsg && (
            <div className="mt-4 text-center text-sm text-red-400 font-medium animate-fade-in">
              {errorMsg}
            </div>
          )}
        </div>

        <button
          onClick={() => verifyOTP(otpValues.join(''))}
          disabled={isVerifying || otpValues.some(v => !v)}
          className="w-full py-3.5 bg-gradient-gold text-navy-950 font-bold rounded-md hover:shadow-gold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mb-6"
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-950 rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </>
          ) : (
            'Verify & Login'
          )}
        </button>

        <div className="text-center text-sm">
          <span className="text-text-secondary">Didn't receive OTP? </span>
          <button 
            onClick={handleResend}
            disabled={isVerifying}
            className="text-gold-500 font-semibold hover:text-gold-400 disabled:opacity-50 transition-colors"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}

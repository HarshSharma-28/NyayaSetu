'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Eye, User, Lock, Contact, ChevronDown, CheckCircle, ArrowRight } from 'lucide-react';
import { IMAGES, getImageWithFallback } from '@/lib/images/image-loader';
import { OTPStore } from '@/lib/auth/otp-store';
import { supabase } from '@/lib/supabase/client';

type Role = 'admin' | 'reviewer' | 'officer';
import { api } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<Role>('admin');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [nicSsoId, setNicSsoId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabels: Record<Role, string> = {
    admin: 'Admin — District Collector',
    reviewer: 'Reviewer — Legal Cell',
    officer: 'Officer — Department Official'
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicSsoId || !password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.sendOTP(nicSsoId);
      
      // Save info locally. In demo mode, backend returns the OTP so we can auto-fill or log it.
      const returnedOTP = (res as any).otp || '';
      OTPStore.save(returnedOTP, selectedRole, nicSsoId);

      router.push('/otp');
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'Authentication failed. Please check credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06111f] flex flex-col md:flex-row relative overflow-hidden font-sans text-white">

      {/* LAYER 0 — FIXED BACKGROUND (DOT GRID) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* TRICOLOR BAR */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-[100]">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#f0ead6]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col justify-between w-[58%] p-16 lg:p-24 relative z-10">
        <div>
          <div className="flex items-center gap-0 mb-2">
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={256} 
              height={256} 
              className="object-contain ml-[-90px]" 
            />
            <div className="flex flex-col ml-[-50px]">
              <span className="text-[64px] font-bold tracking-tight leading-none text-white">NyayaSetu</span>
              <span className="text-[54px] text-[#d4af37] tracking-[2px] uppercase mt-3">न्यायसेतु</span>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <h2 className="text-[52px] font-bold leading-[1.1] tracking-tight mb-8">
            Court orders to <br />
            <span className="text-[#d4af37]">verified action.</span>
          </h2>
          <p className="text-[15px] text-white/40 mb-12 leading-relaxed max-w-md">
            AI-powered compliance platform for Indian government departments. Every court directive — extracted, verified, tracked. Zero missed deadlines.
          </p>

          <div className="w-12 h-[2px] bg-white/10 mb-10"></div>

          <div className="pl-6 border-l border-[#d4af37]/30 mb-16">
            <p className="text-[17px] italic text-white/50 mb-4 font-serif leading-relaxed">
              "Dream, Dream, Dream. Dreams transform into thoughts and thoughts result in action."
            </p>
            <p className="text-[11px] font-bold text-[#d4af37] tracking-[2px] uppercase">— DR. APJ ABDUL KALAM · MISSILE MAN OF INDIA</p>
          </div>

          <div className="flex gap-16">
            <div>
              <div className="text-[32px] font-bold text-white mb-1">3</div>
              <div className="text-[9px] text-white/20 tracking-[2px] uppercase font-bold">Role Layers</div>
            </div>
            <div>
              <div className="text-[32px] font-bold text-white mb-1">100%</div>
              <div className="text-[9px] text-white/20 tracking-[2px] uppercase font-bold">Human Verified</div>
            </div>
            <div>
              <div className="text-[32px] font-bold text-white mb-1">0</div>
              <div className="text-[9px] text-white/20 tracking-[2px] uppercase font-bold">Missed Deadlines</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (LOGIN CARD) */}
      <div className="w-full md:w-[42%] flex items-center justify-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-[440px] bg-[#0a1828]/60 backdrop-blur-2xl border border-white/5 rounded-[32px] p-10 lg:p-12 shadow-2xl relative overflow-hidden">

          <div className="flex flex-col items-center mb-10">
            <div className="w-[180px] h-[200px] relative mb-2">
              <Image
                src="/images/national-emblem.png"
                alt="Emblem"
                fill
                className="object-contain brightness-110"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome back</h3>
            <p className="text-[12px] text-white/30 tracking-tight">Sign in to NyayaSetu — Bridge of Justice</p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-6">

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">Access Type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-10 text-[14px] text-white/80 flex items-center justify-between focus:border-[#d4af37]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-[#d4af37]/60" />
                    <span>{roleLabels[selectedRole]}</span>
                  </div>
                  <ChevronDown size={16} className={`text-white/20 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#0a1828] border border-white/10 rounded-xl py-2 z-50 shadow-2xl animate-fade-in">
                    {(Object.entries(roleLabels) as [Role, string][]).map(([role, label]) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-11 py-3 text-[13px] hover:bg-white/5 transition-colors flex items-center justify-between ${selectedRole === role ? 'text-[#d4af37]' : 'text-white/60'}`}
                      >
                        {label}
                        {selectedRole === role && <CheckCircle size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">NIC SSO ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Contact size={16} className="text-white/20" />
                </div>
                <input
                  type="text"
                  value={nicSsoId}
                  onChange={(e) => setNicSsoId(e.target.value)}
                  placeholder="Enter your NIC SSO ID"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-[14px] text-white placeholder-white/10 focus:border-[#d4af37]/40 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-white/20" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-[14px] text-white placeholder-white/10 focus:border-[#d4af37]/40 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center group cursor-pointer" onClick={() => {/* Toggle state logic if needed */ }}>
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 rounded border-white/10 bg-white/5 text-[#d4af37] focus:ring-offset-0 focus:ring-0 appearance-none cursor-pointer transition-all checked:bg-[#d4af37] checked:border-[#d4af37]"
                />
                <CheckCircle size={10} className="absolute text-[#06111f] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <label className="ml-3 text-[12px] text-white/30 group-hover:text-white/50 transition-colors cursor-pointer">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#d4af37] text-[#06111f] font-bold rounded-xl hover:bg-[#e8c84a] transition-all flex justify-center items-center gap-2 mt-4 shadow-lg shadow-[#d4af37]/10"
            >
              {isLoading ? 'Authenticating...' : 'Continue with OTP'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
            <span className="text-[9px] text-white/10 tracking-[3px] uppercase">सत्यमेव जयते</span>
          </div>
        </div>
      </div>

      {/* VIGNETTE & BLURS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF9933]/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#138808]/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06111f] via-transparent to-[#06111f]/60" />
      </div>
    </div>
  );
}

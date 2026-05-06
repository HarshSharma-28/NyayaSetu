'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Menu, X, Shield, Lock, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// SVG FALLBACK COMPONENTS
// ============================================================================
const GavelSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m14 13-6.5 6.5a2.12 2.12 0 0 1-3-3L11 10" />
    <path d="m18 9-2.5-2.5" />
    <path d="m15 12-2.5-2.5" />
    <path d="M12.5 9.5 20 2" />
    <path d="M15 12 22 5" />
  </svg>
);

const EmblemFallbackSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 150" fill="currentColor" className={className}>
    {/* Simplified Lion Capital representation for fallback */}
    <path d="M20 130 h60 v10 h-60 z" fill="#d4af37" />
    <path d="M25 120 h50 v10 h-50 z" fill="#c9a227" />
    <circle cx="50" cy="115" r="10" fill="#d4af37" />
    <path d="M30 60 q 20 -40 40 0 v50 h-40 z" fill="#d4af37" />
    <path d="M45 40 q 5 -20 10 0 z" fill="#c9a227" />
    <path d="M20 70 q -10 -20 0 -40 q 10 20 0 40 z" fill="#d4af37" />
    <path d="M80 70 q 10 -20 0 -40 q -10 20 0 40 z" fill="#d4af37" />
  </svg>
);

const AshokaChakraSVG = ({ className }: { className?: string }) => {
  const spokes = Array.from({ length: 24 }).map((_, i) => {
    const angle = i * 15;
    const rad = (angle * Math.PI) / 180;
    const rOuter = 118;
    const rInner = 18;
    const cx = 130;
    const cy = 130;

    // Line endpoints (rounded to fix hydration mismatch)
    const x1 = (cx + rInner * Math.sin(rad)).toFixed(3);
    const y1 = (cy - rInner * Math.cos(rad)).toFixed(3);
    const x2 = (cx + rOuter * Math.sin(rad)).toFixed(3);
    const y2 = (cy - rOuter * Math.cos(rad)).toFixed(3);

    // Tip circle center
    const xTip = (cx + 108 * Math.sin(rad)).toFixed(3);
    const yTip = (cy - 108 * Math.cos(rad)).toFixed(3);

    // Diamond between spokes
    const midRad = ((angle + 7.5) * Math.PI) / 180;
    const xDmd = (cx + 75 * Math.sin(midRad)).toFixed(3);
    const yDmd = (cy - 75 * Math.cos(midRad)).toFixed(3);

    return (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={xTip} cy={yTip} r="4.5" fill="#d4af37" />
        <rect
          x={Number(xDmd) - 2}
          y={Number(yDmd) - 2}
          width="4"
          height="4"
          fill="#d4af37"
          transform={`rotate(${angle + 7.5 + 45} ${xDmd} ${yDmd})`}
        />
      </g>
    );
  });

  return (
    <svg
      width="260" height="260" viewBox="0 0 260 260"
      className={cn("animate-slow-spin", className)}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.6)) drop-shadow(0 0 40px rgba(212,175,55,0.3))',
        animation: 'slowSpin 70s linear infinite'
      }}
    >
      <style>{`
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <circle cx="130" cy="130" r="128" fill="none" stroke="#d4af37" strokeWidth="3" />
      <circle cx="130" cy="130" r="122" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="4 3" />
      <circle cx="130" cy="130" r="18" fill="#d4af37" />
      <circle cx="130" cy="130" r="11" fill="#06111f" />
      <circle cx="130" cy="130" r="5" fill="#d4af37" />
      {spokes}
    </svg>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function LandingPage() {
  const router = useRouter();
  const [logoError, setLogoError] = useState(false);
  const [emblemError, setEmblemError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stats counter effect
  const [casesCount, setCasesCount] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const target = 47;
          const duration = 2000;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCasesCount(target);
              clearInterval(timer);
            } else {
              setCasesCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#06111f] text-white selection:bg-[#d4af37] selection:text-[#06111f] overflow-x-hidden font-sans">

      {/* LAYER 0 — FIXED BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(212,175,55,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF9933]/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#138808]/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* LAYER 1 — TRICOLOR BAR */}
      <div className="fixed top-0 left-0 w-full h-1 flex z-[100]">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#f0ead6]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* LAYER 2 — NAVBAR */}
      <nav className="fixed top-1 w-full h-[56px] bg-[#06111f]/85 backdrop-blur-[20px] border-b border-[#d4af37]/10 z-[90] flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-[44px] h-[44px] relative flex items-center justify-center">
            {logoError ? <GavelSVG className="w-8 h-8 text-[#d4af37]" /> : (
              <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={44} 
                height={44} 
                className="object-contain"
                onError={() => setLogoError(true)} 
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-tight leading-none">NyayaSetu</span>
            <span className="text-[9px] text-[#d4af37] leading-none tracking-[2px] uppercase mt-1">न्यायसेतु</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('features')} className="text-[13px] text-white/45 hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-[13px] text-white/45 hover:text-white transition-colors">How it Works</button>
          <button onClick={() => scrollToSection('roadmap')} className="text-[13px] text-white/45 hover:text-white transition-colors">Security</button>
        </div>

        <div className="hidden md:block">
          <button
            onClick={() => router.push('/login')}
            className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-[10px] text-[#d4af37] text-[13px] font-medium px-[22px] py-[9px] hover:bg-[#d4af37]/20 transition-all flex items-center gap-2"
          >
            Login to NyayaSetu <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white/70" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[60px] left-0 w-full bg-[#06111f]/95 backdrop-blur-xl border-b border-[#d4af37]/10 z-[80] flex flex-col p-6 gap-6 md:hidden">
          <button onClick={() => scrollToSection('features')} className="text-left text-lg text-white/80">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-left text-lg text-white/80">How it Works</button>
          <button onClick={() => scrollToSection('roadmap')} className="text-left text-lg text-white/80">Security</button>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#d4af37] text-[#06111f] rounded-[10px] text-[15px] font-bold px-[22px] py-[14px] flex justify-center items-center gap-2 w-full mt-4"
          >
            Login to NyayaSetu <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LAYER 3 — HERO SECTION */}
      <header className="relative w-full min-h-[100dvh] flex flex-col md:flex-row items-center pt-24 pb-12 z-10 overflow-hidden">

        {/* LEFT CONTENT */}
        <div className="w-full md:w-1/2 flex flex-col items-start px-8 md:pl-16 lg:pl-24 z-20 animate-fade-in mt-8 md:mt-0">

          <div className="inline-flex items-center gap-2 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="text-[10px] text-[#d4af37] tracking-[2px] font-medium uppercase">Government Compliance Platform</span>
          </div>

          <h1 className="text-[42px] md:text-[56px] font-bold leading-[1.08] tracking-[-1px] md:tracking-[-2px] mb-6">
            <span className="text-white">Court orders to</span><br />
            <span className="text-[#d4af37] block mt-1">verified action.</span>
          </h1>

          <p className="text-[15px] text-white/40 leading-[1.85] max-w-[400px] mb-10">
            NyayaSetu transforms court judgment PDFs into structured, verified action plans — built for Indian government departments. AI extracts. Humans verify. Zero deadlines missed.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => router.push('/login')}
              className="group bg-[#d4af37] text-[#06111f] text-[15px] font-bold px-8 py-[14px] rounded-xl hover:bg-[#e8c84a] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(212,175,55,0.35)] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Enter NyayaSetu <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-white/30 text-[13px] font-medium hover:text-white/60 transition-colors flex items-center gap-2"
            >
              See how it works <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div ref={statsRef} className="flex items-center gap-6 mt-16 md:mt-20">
            <div className="flex flex-col">
              <span className="text-[26px] font-bold text-[#d4af37]">{casesCount}</span>
              <span className="text-[9px] text-white/25 tracking-[1.5px] font-medium mt-1">CASES PROCESSED</span>
            </div>
            <div className="w-px h-8 bg-[#d4af37]/10" />
            <div className="flex flex-col">
              <span className="text-[26px] font-bold text-[#d4af37]">100%</span>
              <span className="text-[9px] text-white/25 tracking-[1.5px] font-medium mt-1">HUMAN VERIFIED</span>
            </div>
            <div className="w-px h-8 bg-[#d4af37]/10" />
            <div className="flex flex-col">
              <span className="text-[26px] font-bold text-[#d4af37]">0</span>
              <span className="text-[9px] text-white/25 tracking-[1.5px] font-medium mt-1">MISSED DEADLINES</span>
            </div>
          </div>
        </div>

        {/* CENTER-RIGHT COMPOSITION */}
        <div className="relative w-full md:w-1/2 h-[500px] md:h-full flex items-center justify-center mt-12 md:mt-0 z-10 pointer-events-none">
          <div className="relative w-[360px] md:w-[480px] flex flex-col items-center justify-center translate-y-[12%]">

            <div className="absolute top-[-35px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] z-20">
              <AshokaChakraSVG className="w-full h-full text-[#d4af37]/40" />
            </div>

            <div className="relative z-10 w-full h-full flex items-center justify-center" style={{
              filter: 'drop-shadow(0 0 60px rgba(212,175,55,0.4)) drop-shadow(0 0 120px rgba(212,175,55,0.15))'
            }}>
              {emblemError ? (
                <EmblemFallbackSVG className="w-[480px] h-[480px] text-[#d4af37]" />
              ) : (
                <Image
                  src="/images/national-emblem.png"
                  alt="National Emblem of India"
                  width={480}
                  height={480}
                  className="object-contain brightness-110"
                  priority
                  onError={() => setEmblemError(true)}
                />
              )}
            </div>
          </div>

          {/* VIGNETTES */}
          <div className="absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-[#06111f] via-[#06111f]/85 to-transparent z-[4]" />
          <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-[#06111f] to-transparent z-[4]" />
          <div className="absolute bottom-0 inset-x-0 h-[200px] bg-gradient-to-t from-[#06111f] to-transparent z-[6]" />

          <div className="absolute bottom-12 right-12 z-20 flex items-center gap-3">
            <div className="w-[3px] h-[22px] flex flex-col">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-[#f0ead6]" />
              <div className="flex-1 bg-[#138808]" />
            </div>
            <span className="text-[9px] text-white/20 tracking-[2.5px] font-medium">JAI HIND · सत्यमेव जयते</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-8 md:left-16 lg:left-24 z-20 flex items-center gap-4">
          <div className="w-7 h-[1px] bg-[#d4af37]" />
          <span className="text-[9px] text-white/20 tracking-[2.5px] font-medium">SCROLL TO EXPLORE</span>
        </div>
      </header>

      {/* LAYER 4 — FEATURES SECTION */}
      <section id="features" className="w-full px-8 md:px-16 lg:px-24 py-20 md:py-24 relative z-20 bg-[#06111f]">
        <div className="mb-14">
          <p className="text-[10px] text-[#d4af37] tracking-[3px] font-medium mb-3">WHAT WE DO</p>
          <h2 className="text-[32px] font-semibold text-white tracking-[-0.8px] mb-4">
            Built for <span className="text-[#d4af37]">Bharat's</span> judiciary system
          </h2>
          <p className="text-[14px] text-white/35 max-w-[480px] leading-relaxed">
            A comprehensive suite of tools designed to ensure strict compliance with court directives, eliminating human error in tracking and assigning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { t: "Judgment DNA™", tag: "PROPRIETARY SCHEMA", d: "Structured extraction schema that fingerprints every court order with machine-readable precision" },
            { t: "Deadline Intelligence", tag: "AUTO DATE RESOLVE", d: "'4 weeks' becomes an exact calendar date with a live countdown and priority alert" },
            { t: "Auto Department Routing", tag: "SMART ROUTING", d: "Directives automatically routed to Finance, HR, Revenue, Legal Cell — no manual assignment" },
            { t: "Human Verification Layer", tag: "MANDATORY HITL", d: "Zero unverified AI output reaches decision-makers. Every directive is approve/edit/rejected by a human" },
            { t: "Immutable Audit Trail", tag: "TAMPER-PROOF", d: "Every action logged forever — who approved what, when, and why. Court-ready compliance records" },
            { t: "Role-Based Access", tag: "3-LAYER SECURITY", d: "Admin, Reviewer, Officer — each sees only what they need. Production-ready for NIC SSO" },
          ].map((f, i) => (
            <div key={i} className="relative bg-[#ffffff]/[0.02] border border-[#ffffff]/[0.05] rounded-2xl p-7 hover:bg-[#ffffff]/[0.04] transition-colors overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white font-medium text-lg mb-2">{f.t}</h3>
              <p className="text-[13px] text-white/40 leading-relaxed mb-6">{f.d}</p>
              <div className="inline-block bg-[#d4af37]/[0.08] border border-[#d4af37]/20 rounded-full px-2.5 py-1">
                <span className="text-[9px] text-[#d4af37] tracking-[1px] uppercase font-medium">{f.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LAYER 5 — HOW IT WORKS */}
      <section id="how-it-works" className="w-full bg-black/15 px-8 md:px-16 lg:px-24 py-20 md:py-28 relative z-20 border-y border-[#ffffff]/[0.02]">
        <div className="mb-16 md:mb-24 text-center md:text-left">
          <p className="text-[10px] text-[#d4af37] tracking-[3px] font-medium mb-3">WORKFLOW</p>
          <h2 className="text-[32px] font-semibold text-white tracking-[-0.8px]">
            From PDF to action in 4 steps
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[28px] left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {[
              { n: "01", t: "Upload", d: "Upload any court judgment PDF — scanned or digital" },
              { n: "02", t: "Extract", d: "AI reads and maps Judgment DNA™ — every directive, deadline, department" },
              { n: "03", t: "Verify", d: "Human reviewer approves, edits, or rejects. Nothing moves without sign-off" },
              { n: "04", t: "Act", d: "Dashboard shows only verified action plans — department-filtered, deadline-sorted" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-[56px] h-[56px] rounded-full border border-[#d4af37] bg-[#06111f] flex items-center justify-center text-[#d4af37] text-[18px] font-bold mb-6 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                  {s.n}
                </div>
                <h3 className="text-white font-medium text-lg mb-3">{s.t}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed max-w-[200px]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAYER 6 — BHAGAT SINGH QUOTE */}
      <section className="w-full px-8 py-24 md:py-32 flex flex-col items-center justify-center text-center relative z-20">
        <div className="absolute text-[120px] text-[#d4af37]/[0.04] font-serif leading-none -translate-y-8 select-none">"</div>
        <p className="text-[20px] md:text-[24px] italic text-white/55 max-w-[640px] leading-relaxed relative z-10 mb-8 font-serif">
          "They may kill me, but they cannot kill my ideas. They can crush my body, but they will not be able to crush my spirit."
        </p>
        <div className="flex flex-col items-center gap-4">
          <span className="text-[11px] text-[#d4af37]/45 tracking-[2px] uppercase font-medium">
            — SHAHEED BHAGAT SINGH · THE SPIRIT BEHIND NYAYASETU
          </span>
          <div className="w-12 h-[3px] flex mt-2 opacity-50">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-[#f0ead6]" />
            <div className="flex-1 bg-[#138808]" />
          </div>
        </div>
      </section>

      {/* LAYER 7 — SECURITY ROADMAP */}
      <section id="roadmap" className="w-full bg-[#d4af37]/[0.02] border-y border-[#d4af37]/[0.06] px-8 md:px-16 lg:px-24 py-20 md:py-24 relative z-20">
        <div className="mb-14">
          <h2 className="text-[28px] font-semibold text-white tracking-[-0.5px] mb-3">
            Built for Production. Designed for Trust.
          </h2>
          <p className="text-[14px] text-white/40 max-w-[500px]">
            Security architecture that scales from prototype to government-grade deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#06111f]/50 backdrop-blur-sm border border-[#ffffff]/5 border-t-[#16a34a]/60 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <span className="text-white text-[15px] font-medium">Phase 1 (Live Now)</span>
            </div>
            <ul className="space-y-3">
              {['JWT Authentication', 'Strict RBAC', 'Immutable Audit Log', 'Rate Limiting', 'Security Headers', 'Soft Deletes Only', 'Input Sanitization'].map(i => (
                <li key={i} className="text-[13px] text-white/40 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white/20" /> {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#06111f]/50 backdrop-blur-sm border border-[#ffffff]/5 border-t-[#f59e0b]/60 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-[15px] font-medium">Phase 2 (In Progress)</span>
            </div>
            <ul className="space-y-3">
              {['E2E Encryption', 'Zero Trust Architecture', 'On-premise LLM (Ollama)', 'NIC SSO Integration'].map(i => (
                <li key={i} className="text-[13px] text-white/40 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white/20" /> {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#06111f]/50 backdrop-blur-sm border border-[#ffffff]/5 border-t-[#d4af37]/60 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Shield className="w-32 h-32 text-[#d4af37]" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-[#d4af37]" />
                <span className="text-white text-[15px] font-medium">Phase 3 (Planned)</span>
              </div>
              <ul className="space-y-3 mb-6">
                {['AWS Nitro Enclaves (TEE)', 'Enclave-isolated PDF processing', 'CERT-In Compliance', 'Air-gapped deployment option'].map(i => (
                  <li key={i} className="text-[13px] text-white/40 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/20" /> {i}
                  </li>
                ))}
              </ul>
              <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg p-3">
                <p className="text-[11px] text-[#d4af37]/80 leading-relaxed">
                  * TEE ensures even the cloud provider cannot access court document contents during extraction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 8 — FINAL CTA */}
      <section className="w-full bg-[#d4af37]/[0.03] border-t border-[#d4af37]/[0.08] px-8 py-24 md:py-32 flex flex-col items-center text-center relative z-20">
        <div className="mb-8 opacity-60">
          {emblemError ? <GavelSVG className="w-12 h-12 text-[#d4af37]" /> : (
            <Image src="/images/national-emblem.png" alt="Emblem" width={48} height={64} className="opacity-80" onError={() => setEmblemError(true)} />
          )}
        </div>
        <h2 className="text-[36px] md:text-[42px] font-bold text-white tracking-[-1px] mb-4">
          Ready to bring <span className="text-[#d4af37]">justice</span> to action?
        </h2>
        <p className="text-[14px] text-white/35 max-w-[480px] leading-relaxed mb-10">
          Join NyayaSetu — where court orders become verified compliance, and deadlines are never missed.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="bg-[#d4af37] text-[#06111f] text-[16px] font-bold px-10 py-[16px] rounded-xl hover:bg-[#e8c84a] hover:shadow-[0_8px_32px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          Enter NyayaSetu — Login <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* LAYER 9 — FOOTER */}
      <footer className="w-full px-8 md:px-16 lg:px-24 py-10 border-t border-white/5 bg-[#06111f] relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-3 opacity-50">
            {logoError ? <GavelSVG className="w-6 h-6 text-[#d4af37]" /> : (
              <Image src="/images/logo.png" alt="Logo" width={24} height={24} className="rounded-md" onError={() => setLogoError(true)} />
            )}
            <span className="text-[14px] font-semibold tracking-tight text-white">NyayaSetu</span>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact', 'About'].map(l => (
              <a key={l} href="#" className="text-[12px] text-white/25 hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
          <span className="text-[11px] text-white/15">© 2026 NyayaSetu · All rights reserved</span>
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-3 flex flex-col opacity-30">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-[#f0ead6]" />
              <div className="flex-1 bg-[#138808]" />
            </div>
            <span className="text-[10px] text-white/15 tracking-[2px]">JAI HIND · सत्यमेव जयते</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

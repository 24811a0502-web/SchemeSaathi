'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Shield, Users, FileText, MessageSquare, AlertTriangle,
  TrendingUp, ChevronRight, Globe, Star, ArrowRight
} from 'lucide-react';

const features = [
  { icon: MessageSquare, title: 'AI Civic Agent', desc: 'Natural language Q&A about government schemes', href: '/agent', color: 'text-cyan-400' },
  { icon: Users, title: 'Family Benefit Finder', desc: 'Find schemes for your entire family', href: '/family', color: 'text-emerald-400' },
  { icon: TrendingUp, title: 'Scheme Discovery', desc: 'Personalized scheme matching engine', href: '/schemes', color: 'text-blue-400' },
  { icon: Shield, title: 'Scam Detection', desc: 'Analyze suspicious messages and links', href: '/scam', color: 'text-orange-400' },
  { icon: FileText, title: 'PDF Simplifier', desc: 'Understand complex government documents', href: '/simplifier', color: 'text-purple-400' },
  { icon: AlertTriangle, title: 'Conflict Detector', desc: 'Spot contradictions in official information', href: '/conflicts', color: 'text-yellow-400' },
];

const stats = [
  { label: 'Government Schemes', value: '11+' },
  { label: 'States Covered', value: 'All India + AP' },
  { label: 'Languages', value: 'EN / TE / HI' },
  { label: 'AI Verified', value: '100%' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">SS</div>
          <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SchemeSaathi</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {(['en', 'te', 'hi'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${language === lang ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          {isAuthenticated ? (
            <Link href="/dashboard" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {t('dashboard')} →
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth/login" className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
                {t('login')}
              </Link>
              <Link href="/auth/signup" className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {t('signup')}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 text-sm text-cyan-400 mb-6">
            <Star className="w-4 h-4" /> AI-Powered · Evidence-Based · Verified Sources
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('welcome')}
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            {t('tagline')} — Discover schemes you qualify for, verify eligibility with real rules, detect scams, and navigate government documents with AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? '/dashboard' : '/auth/signup'}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login"
              className="border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
              Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 border-y border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Complete Government Scheme Platform</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Every feature built with verified government data, deterministic eligibility rules, and transparent evidence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Link key={f.href} href={isAuthenticated ? f.href : '/auth/login'}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-6 transition-all hover:bg-slate-800/50">
                <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
                <h3 className="font-semibold text-lg mb-2 group-hover:text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{f.desc}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-cyan-400 transition-colors">
                  Explore <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Built on Verified Government Information</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every scheme answer includes official source citations, verification dates, and trust labels.
            Our deterministic eligibility engine uses real government rules — Gemini AI only explains, never invents.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start Finding Your Benefits Today</h2>
          <p className="text-slate-400 mb-8">Free to use. No Aadhaar required to explore.</p>
          <Link href={isAuthenticated ? '/dashboard' : '/auth/signup'}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <p>SchemeSaathi – Hackathon Project | Government information sourced from official portals only</p>
        <p className="mt-1 text-xs">Not an official government website. Eligibility results are preliminary and informational only.</p>
      </footer>
    </div>
  );
}

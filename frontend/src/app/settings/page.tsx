'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Globe, Shield, Trash2, Key } from 'lucide-react';

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Preferences & Data Governance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Settings & Privacy Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure system language, voice response options, and exercise your full document deletion rights.
          </p>
        </div>

        {/* Language Preference Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>System & AI Output Language</span>
          </div>
          <p className="text-xs text-slate-400">
            Select your preferred language. AI Civic Agent and PDF Simplifier will automatically respond in this language.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English', sub: 'Standard' },
              { id: 'te', label: 'తెలుగు (Telugu)', sub: 'ఆంధ్రప్రదేశ్' },
              { id: 'hi', label: 'हिंदी (Hindi)', sub: 'राष्ट्रीय' },
            ].map((lng) => (
              <button
                key={lng.id}
                onClick={() => setLanguage(lng.id as any)}
                className={`p-4 rounded-xl border text-left transition ${
                  language === lng.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-sm">{lng.label}</div>
                <div className="text-[10px] text-slate-500 mt-1">{lng.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Governance & Privacy Guarantee */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Citizen Data Sovereignty & Zero Plaintext ID Policy</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              • SchemeSaathi <strong>never</strong> stores 12-digit Aadhaar numbers, OTPs, or banking passwords in plaintext.
            </p>
            <p>
              • All uploaded government documents and OCR analysis logs are stored under Row-Level Security (RLS) linked strictly to your account.
            </p>
            <p>
              • You retain the right to delete any or all uploaded documents permanently at any time.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { schemes, profile, family, journey } from '@/lib/api';
import { StatusBadge, TrustBadge } from '@/components/ui/Badge';
import {
  Sparkles,
  Users,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profRes, famRes, journRes] = await Promise.allSettled([
        profile.get(),
        family.list(),
        journey.list()
      ]);

      if (profRes.status === 'fulfilled') setProfileData(profRes.value);
      if (famRes.status === 'fulfilled') setFamilyMembers(famRes.value as any[]);
      if (journRes.status === 'fulfilled') setJourneys(journRes.value as any[]);

      // Run matchmaker if profile exists
      try {
        const matches = await schemes.matchForUser();
        setMatchData(matches);
      } catch (err) {
        console.warn('Matchmaker requires complete profile:', err);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const seedDemoFamily = async () => {
    try {
      setLoading(true);
      await family.seedDemo();
      await loadDashboard();
    } catch (e: any) {
      setError(e.message || 'Failed to seed demo family');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/20 p-6 md:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deterministic Engine & Verified Official Evidence</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Namaste, {user?.full_name || 'Citizen'} 👋
              </h1>
              <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
                SchemeSaathi is actively analyzing central government and Andhra Pradesh welfare schemes for you and your household members.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI Civic Agent
              </Link>
              <button
                onClick={seedDemoFamily}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                Load 4-Member Demo Family
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Potentially Eligible</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-300">
              {matchData?.eligible_matches?.length ?? 0} Schemes
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Based on deterministic rule engine</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Household Members</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300">{familyMembers.length} Members</div>
            <p className="text-[11px] text-slate-400 mt-1">Evaluated independently without cross-leakage</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Active Journeys</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-300">{journeys.length} Schemes</div>
            <p className="text-[11px] text-slate-400 mt-1">Tracked across 9 verification stages</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur hover:border-cyan-500/30 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>More Info Needed</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {matchData?.needs_more_info?.length ?? 0} Schemes
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Requires profile completion</p>
          </div>
        </div>

        {/* Two-Column Grid: Scheme Matches & Quick Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Matches Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Personalized Matched Schemes
              </h2>
              <Link href="/schemes" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                View All Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm">
                Evaluating schemes against profile...
              </div>
            ) : matchData?.eligible_matches?.length ? (
              <div className="space-y-3">
                {matchData.eligible_matches.slice(0, 4).map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-cyan-500/40 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100 text-base">{m.scheme_name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                            {m.applicable_state}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium mt-1">
                          Beneficiary: <span className="font-semibold text-slate-200">{m.member}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={m.status} />
                        <TrustBadge trustLabel={m.trust_label} />
                      </div>
                    </div>

                    {m.benefit_estimate && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                        <span className="font-bold">Estimated Benefit: </span>
                        {m.benefit_estimate}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                      <div className="text-slate-400">
                        {m.required_documents?.length > 0 && (
                          <span>Requires {m.required_documents.length} documents</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/eligibility?scheme=${m.scheme_key}`}
                          className="text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Check Criteria
                        </Link>
                        {m.official_url && (
                          <a
                            href={m.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                <p className="text-slate-400 text-sm">
                  Complete your profile or add family members to unlock automatic scheme matches.
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
                  >
                    Complete Profile
                  </Link>
                  <button
                    onClick={seedDemoFamily}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Load Demo Family
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-6">
            {/* 4-Member Demo Household Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Demonstration Family
                </h3>
                <Link href="/family" className="text-xs text-cyan-400 hover:underline">
                  Finder →
                </Link>
              </div>

              {familyMembers.length > 0 ? (
                <div className="space-y-2">
                  {familyMembers.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{mem.name}</p>
                        <p className="text-slate-400 text-[11px] capitalize">
                          {mem.relation} · {mem.age} yrs · {mem.occupation || 'N/A'}
                        </p>
                      </div>
                      {mem.is_demo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Demo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-slate-400">No family members enrolled yet.</p>
                  <button
                    onClick={seedDemoFamily}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition"
                  >
                    Populate Demo Family
                  </button>
                </div>
              )}
            </div>

            {/* Quick Action Tools */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-200">Security & Document Tools</h3>
              <div className="space-y-2">
                <Link
                  href="/scam"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                    <span>WhatsApp / SMS Scam Shield</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/simplifier"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>PDF Scheme Simplifier</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/documents"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-cyan-400" />
                    <span>Document Rejection Guard</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/reports"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Generate Official PDF Report</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

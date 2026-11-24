'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { eligibility, profile } from '@/lib/api';
import { StatusBadge, TrustBadge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Calculator
} from 'lucide-react';

function EligibilityContent() {
  const searchParams = useSearchParams();
  const preselectedScheme = searchParams?.get('scheme') || '';

  const [form, setForm] = useState({
    scheme_key: preselectedScheme,
    age: 45,
    gender: 'male',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    annual_income: 80000,
    occupation: 'farmer',
    education: 'secondary',
    category: 'OBC',
    is_farmer: true,
    is_student: false,
    has_disability: false,
  });

  const [supportedSchemes, setSupportedSchemes] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eligibility.supportedSchemes().then((data: any) => {
      setSupportedSchemes(data.schemes || []);
    }).catch(console.error);

    // Load user profile defaults
    profile.get().then((prof: any) => {
      if (prof) {
        setForm((prev) => ({
          ...prev,
          age: prof.age || prev.age,
          gender: prof.gender || prev.gender,
          state: prof.state || prev.state,
          district: prof.district || prev.district,
          annual_income: prof.annual_income || prev.annual_income,
          occupation: prof.occupation || prev.occupation,
          is_farmer: prof.is_farmer ?? prev.is_farmer,
          is_student: prof.is_student ?? prev.is_student,
          category: prof.category || prev.category,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res: any = await eligibility.check({
        ...form,
        scheme_key: form.scheme_key || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Eligibility check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
          <Calculator className="w-3.5 h-3.5" />
          <span>Deterministic Python Engine · Authoritative Rules</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Deterministic Scheme Eligibility Checker
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Every verification runs strictly through pure Python rule logic based on published central and state gazettes. AI explains the outcome but is mathematically prevented from overriding rule decisions.
        </p>
      </div>

      {/* Input Form & Evaluation Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Citizen Profile Parameters</span>
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Scheme</label>
              <select
                value={form.scheme_key}
                onChange={(e) => setForm({ ...form, scheme_key: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="">Evaluate All Supported Schemes</option>
                {supportedSchemes.map((sch) => (
                  <option key={sch} value={sch}>
                    {sch.replace(/-/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">District</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  value={form.annual_income}
                  onChange={(e) => setForm({ ...form, annual_income: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Social Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                placeholder="farmer / student / homemaker"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_farmer}
                  onChange={(e) => setForm({ ...form, is_farmer: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                />
                <span>Farmer / Cultivator</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_student}
                  onChange={(e) => setForm({ ...form, is_student: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                />
                <span>Enrolled Student</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20 text-sm"
            >
              {loading ? 'Evaluating deterministic rules...' : 'Run Eligibility Check'}
            </button>
          </form>
        </div>

        {/* Results Output */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              {result.results ? (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-white">
                    Evaluation across {result.results.length} Central & State Schemes
                  </h2>
                  {result.results.map((sch: any) => (
                    <div
                      key={sch.scheme_key}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-100 text-sm capitalize">
                          {sch.scheme_key.replace(/-/g, ' ')}
                        </h3>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={sch.status} />
                          <TrustBadge trustLabel={sch.trust_label} />
                        </div>
                      </div>

                      {sch.benefit_estimate && (
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                          <strong>Estimated Benefit: </strong> {sch.benefit_estimate}
                        </div>
                      )}

                      {sch.reasons?.length > 0 && (
                        <div className="text-xs text-slate-300">
                          <span className="font-semibold text-slate-400">Rule Logic: </span>
                          {sch.reasons.join('; ')}
                        </div>
                      )}

                      {sch.missing_info?.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                          <span className="font-bold">Missing Attributes: </span>
                          {sch.missing_info.join(', ')}
                        </div>
                      )}

                      {sch.required_documents?.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px] pt-1">
                          <span className="text-slate-400">Required: </span>
                          {sch.required_documents.map((d: string, i: number) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}

                      {sch.official_source && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Source: {sch.official_source}</span>
                          {sch.source_url && (
                            <a
                              href={sch.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                            >
                              Official Portal <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white capitalize">
                      {result.scheme_key.replace(/-/g, ' ')}
                    </h2>
                    <StatusBadge status={result.status} />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Evidence Status:</span>
                      <TrustBadge trustLabel={result.trust_label} />
                    </div>
                    {result.last_verified && (
                      <p className="text-slate-400">Verified against official sources: {result.last_verified}</p>
                    )}
                  </div>

                  {result.benefit_estimate && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                      <div className="font-bold text-sm">Calculated Benefit Entitlement</div>
                      <div>{result.benefit_estimate}</div>
                    </div>
                  )}

                  {result.reasons?.length > 0 && (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="font-bold text-slate-200">Evaluation Findings:</div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        {result.reasons.map((r: string, i: number) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.missing_info?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <span className="font-bold">Missing Information to Confirm: </span>
                      {result.missing_info.join(', ')}
                    </div>
                  )}

                  {result.required_documents?.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-slate-200">Mandatory Application Documents:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.required_documents.map((d: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.source_url && (
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Official Portal:</span>
                      <a
                        href={result.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        {result.official_source || 'Visit Portal'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-700" />
              <p>Configure parameters on the left and click 'Run Eligibility Check' to view deterministic verification results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EligibilityCheckerPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-12 text-center text-slate-400 text-sm">Loading eligibility checker...</div>}>
        <EligibilityContent />
      </Suspense>
    </AppLayout>
  );
}

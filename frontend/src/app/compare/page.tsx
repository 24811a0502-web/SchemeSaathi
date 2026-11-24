'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { schemes } from '@/lib/api';
import { TrustBadge } from '@/components/ui/Badge';
import { GitCompare, ExternalLink, Check, X } from 'lucide-react';

export default function ComparePage() {
  const [allSchemes, setAllSchemes] = useState<any[]>([]);
  const [selectedA, setSelectedA] = useState<string>('pm-kisan');
  const [selectedB, setSelectedB] = useState<string>('ap-rythu-bharosa');
  const [schemeA, setSchemeA] = useState<any>(null);
  const [schemeB, setSchemeB] = useState<any>(null);

  useEffect(() => {
    schemes.list().then((data: any) => {
      setAllSchemes(data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedA) schemes.get(selectedA).then(setSchemeA).catch(() => {});
  }, [selectedA]);

  useEffect(() => {
    if (selectedB) schemes.get(selectedB).then(setSchemeB).catch(() => {});
  }, [selectedB]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Multi-Scheme Decision Matrix</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Government Scheme Comparison
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Side-by-side comparative analysis of benefits, income thresholds, eligible categories, and required certificates to choose the best program for your household.
          </p>
        </div>

        {/* Scheme Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-cyan-400 mb-1">Scheme A</label>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {allSchemes.map((s) => (
                <option key={s.scheme_key} value={s.scheme_key}>
                  {s.name} ({s.applicable_state})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-blue-400 mb-1">Scheme B</label>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {allSchemes.map((s) => (
                <option key={s.scheme_key} value={s.scheme_key}>
                  {s.name} ({s.applicable_state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        {schemeA && schemeB && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4 w-1/4">Feature / Metric</th>
                  <th className="p-4 w-3/8 text-cyan-300">{schemeA.name}</th>
                  <th className="p-4 w-3/8 text-blue-300">{schemeB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Jurisdiction</td>
                  <td className="p-4">{schemeA.applicable_state}</td>
                  <td className="p-4">{schemeB.applicable_state}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Financial Benefits</td>
                  <td className="p-4 text-emerald-300 font-medium">{schemeA.benefits || 'Non-financial'}</td>
                  <td className="p-4 text-emerald-300 font-medium">{schemeB.benefits || 'Non-financial'}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Income Limit</td>
                  <td className="p-4">
                    {schemeA.income_limit ? `Up to ₹${schemeA.income_limit.toLocaleString()}/yr` : 'No explicit ceiling'}
                  </td>
                  <td className="p-4">
                    {schemeB.income_limit ? `Up to ₹${schemeB.income_limit.toLocaleString()}/yr` : 'No explicit ceiling'}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Eligibility Summary</td>
                  <td className="p-4 leading-relaxed">{schemeA.eligibility_summary}</td>
                  <td className="p-4 leading-relaxed">{schemeB.eligibility_summary}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Required Documents</td>
                  <td className="p-4">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {schemeA.required_documents?.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {schemeB.required_documents?.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Official Portal</td>
                  <td className="p-4">
                    {schemeA.official_url && (
                      <a
                        href={schemeA.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        Visit Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    {schemeB.official_url && (
                      <a
                        href={schemeB.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        Visit Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-400">Verification Status</td>
                  <td className="p-4"><TrustBadge trustLabel={schemeA.verification_status} /></td>
                  <td className="p-4"><TrustBadge trustLabel={schemeB.verification_status} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

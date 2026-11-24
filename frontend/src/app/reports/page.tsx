'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { reports } from '@/lib/api';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function ReportsPage() {
  const [reportList, setReportList] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data: any = await reports.list();
      setReportList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setGenerating(true);
      const blob: any = await reports.generate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SchemeSaathi_Household_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Report generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Official Citizen Benefit Report</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Citizen Reports & Impact Dossier
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Generate and download official PDF summaries containing your complete profile, independent family eligibility evaluations, document checklists, and application steps.
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            {generating ? 'Compiling Official PDF...' : 'Download Personal Scheme Dossier'}
          </button>
        </div>

        {/* Feature summary card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Grounded Evidence</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cites verified government gazette rules, statutory income ceilings, and official URLs.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent Evaluation</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluates all four household members independently without cross-leakage.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Actionable Checklists</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Includes comprehensive document readiness checklists for Village Secretariats or CSCs.
            </p>
          </div>
        </div>

        {/* Historical Generated Reports */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Generated Report History</h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading report history...
            </div>
          ) : reportList.length > 0 ? (
            <div className="space-y-2">
              {reportList.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{r.title || 'Scheme Dossier'}</p>
                      <p className="text-[11px] text-slate-400">
                        Generated on {new Date(r.generated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5 font-semibold text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No previous reports found. Click 'Download Personal Scheme Dossier' above to generate one now!
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

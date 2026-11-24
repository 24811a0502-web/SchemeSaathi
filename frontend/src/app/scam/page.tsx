'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { scam } from '@/lib/api';
import { StatusBadge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Upload,
  Link2,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';

export default function ScamDetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !textContent.trim() && !url.trim()) {
      setError('Please provide an image screenshot, suspicious message text, or a URL to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fd = new FormData();
      if (file) fd.append('file', file);
      if (textContent.trim()) fd.append('text_content', textContent.trim());
      if (url.trim()) fd.append('url', url.trim());

      const res: any = await scam.analyze(fd);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Scam analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleWhatsAppScam = () => {
    setTextContent(
      '🚨 PM-KISAN 16th INSTALLMENT EMERGENCY ALERT: Your Rs 6,000 is on hold! Click immediately to pay registration fee of Rs 250 at http://pm-kisan-claim-subsidy.in/verify to claim before 6 PM today or account permanently blocked. Send OTP to our official agent on 9876543210.'
    );
    setUrl('http://pm-kisan-claim-subsidy.in/verify');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Multimodal Vision & NLP · Citizen Protection</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Multimodal Scam Shield
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload WhatsApp forward screenshots, suspicious SMS texts, or lookalike domain URLs. Analyzes registration fees, phishing traps, urgency coercion, and credential harvesting.
          </p>
        </div>

        {/* Input Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Provide Suspicious Material</h2>
            <button
              onClick={loadSampleWhatsAppScam}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 font-semibold border border-orange-500/30 transition"
            >
              Load Sample Scam Forward
            </button>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Image / PDF Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                WhatsApp Screenshot or Poster (PNG, JPG, PDF)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer relative bg-slate-950/40">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <p className="text-xs text-slate-300 font-medium">
                    {file ? file.name : 'Click or drop screenshot / poster here'}
                  </p>
                  <p className="text-[11px] text-slate-500">Max size: 10MB</p>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-3 relative w-40 h-28 rounded-lg overflow-hidden border border-slate-700">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Suspicious Message Text */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                WhatsApp Forward / SMS Message Text
              </label>
              <textarea
                rows={3}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste the suspicious WhatsApp message or SMS text here..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Suspicious URL */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Suspicious Link / Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://pm-kisan-claim-subsidy.in/verify"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Analyzing for fraud indicators...' : 'Analyze Suspicious Material'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Analysis Results Display */}
        {analysis && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Fraud Risk Assessment</h3>
                <p className="text-xs text-slate-400">
                  Analyzed at: {new Date(analysis.analyzed_at || Date.now()).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={analysis.classification} />
                {analysis.risk_level && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    analysis.risk_level === 'CRITICAL' || analysis.risk_level === 'HIGH'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {analysis.risk_level} Risk
                  </span>
                )}
              </div>
            </div>

            {/* Explanation */}
            {analysis.explanation && (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 leading-relaxed">
                <span className="font-bold text-slate-100">Assessment Summary: </span>
                {analysis.explanation}
              </div>
            )}

            {/* Evidence items */}
            {analysis.evidence?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Identified Red Flags & Suspicious Elements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysis.evidence.map((ev: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300"
                    >
                      • {ev}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Source Comparison */}
            {analysis.official_comparison && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
                <div className="font-bold text-cyan-300">How Genuine Government Schemes Operate:</div>
                <p className="leading-relaxed">{analysis.official_comparison}</p>
              </div>
            )}

            {/* Safety Recommendations */}
            {analysis.safety_recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Immediate Protective Actions
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                  {analysis.safety_recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Golden Rule Warning */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-white">Golden Rule: </strong>
              Genuine Indian central and state welfare programs never charge registration fees via UPI, never ask for Aadhaar OTPs over WhatsApp, and only use official <code className="text-cyan-300">.gov.in</code> or <code className="text-cyan-300">.nic.in</code> portals.
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { simplifier } from '@/lib/api';
import { TrustBadge } from '@/components/ui/Badge';
import {
  FileText,
  Upload,
  Sparkles,
  Send,
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export default function SimplifierPage() {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [simplifiedResult, setSimplifiedResult] = useState<any>(null);
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswers, setQaAnswers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a government scheme PDF document.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res: any = await simplifier.simplify(file, language);
      setSimplifiedResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to simplify document');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !simplifiedResult?.document_id) return;

    try {
      setQaLoading(true);
      const res: any = await simplifier.qa(
        simplifiedResult.document_id,
        qaQuestion.trim(),
        language
      );
      setQaAnswers((prev) => [
        ...prev,
        {
          question: qaQuestion.trim(),
          answer: res.answer,
          sources: res.sources,
        },
      ]);
      setQaQuestion('');
    } catch (err: any) {
      alert(err.message || 'Q&A query failed');
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PyMuPDF Text Extraction & Grounded Summarization</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Government PDF Simplifier
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload dense 50-page government guidelines or official gazette notifications. Extracts objectives, eligibility thresholds, benefits, required certificates, and page citations in plain language.
          </p>
        </div>

        {/* Upload Form */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Select Official Government Scheme PDF
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-6 text-center cursor-pointer relative bg-slate-950/40">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileText className="w-7 h-7 text-purple-400" />
                  <p className="text-slate-200 font-medium text-xs">
                    {file ? file.name : 'Click or drag official scheme PDF here'}
                  </p>
                  <p className="text-[11px] text-slate-500">Official guidelines, GO orders, or application manuals (Max: 10MB)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold transition shadow-lg shadow-purple-500/20 text-sm"
            >
              {loading ? 'Extracting & De-obfuscating PDF Content...' : 'Simplify Document in Plain Language'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Simplified Output */}
        {simplifiedResult && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Plain-Language Scheme Breakdown</h3>
                <TrustBadge trustLabel={simplifiedResult.trust_label} />
              </div>

              <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {simplifiedResult.simplified_content}
              </div>
            </div>

            {/* Follow-up RAG Q&A on this specific document */}
            {simplifiedResult.document_id && (
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Ask Specific Questions on This Document (RAG)</h3>
                </div>

                {/* Previous Q&A */}
                {qaAnswers.length > 0 && (
                  <div className="space-y-3">
                    {qaAnswers.map((qa, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
                        <p className="font-semibold text-cyan-300">Q: {qa.question}</p>
                        <p className="text-slate-200 whitespace-pre-wrap">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="e.g. What is the application deadline mentioned on page 4?"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={qaLoading || !qaQuestion.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-40"
                  >
                    {qaLoading ? 'Searching...' : 'Ask Document'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

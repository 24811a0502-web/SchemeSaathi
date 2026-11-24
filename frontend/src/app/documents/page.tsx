'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { documents, schemes } from '@/lib/api';
import {
  FileCheck,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function DocumentIntelligencePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetScheme, setTargetScheme] = useState('');
  const [schemeList, setSchemeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    schemes.list().then((data: any) => setSchemeList(data || [])).catch(() => {});
    loadSavedDocuments();
  }, []);

  const loadSavedDocuments = async () => {
    try {
      const data: any = await documents.list();
      setSavedDocs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please upload at least one document to analyze.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res: any = await documents.analyze(files, targetScheme || undefined);
      setAnalysis(res);
      await loadSavedDocuments();
    } catch (err: any) {
      setError(err.message || 'Document analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this document analysis record?')) return;
    try {
      await documents.remove(id);
      await loadSavedDocuments();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Document Intelligence & Rejection Guard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Document Pre-Check & Rejection Guard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload your application documents (Aadhaar, income certificates, land passbooks, marksheets). Detects name discrepancies, expired validity dates, and missing statutory prerequisites before submission.
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Upload Application Dossier</h2>

          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Scheme (Optional)</label>
              <select
                value={targetScheme}
                onChange={(e) => setTargetScheme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">General Document Audit (No specific scheme)</option>
                {schemeList.map((sch) => (
                  <option key={sch.scheme_key} value={sch.scheme_key}>
                    {sch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2">
                Select Documents (PDF, JPG, PNG)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-5 text-center cursor-pointer relative bg-slate-950/40">
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <p className="text-slate-300 font-medium">
                    {files.length > 0
                      ? `${files.length} document(s) selected: ${files.map((f) => f.name).join(', ')}`
                      : 'Drop Aadhaar, Income Certificate, Marks Sheet, Land Passbook here'}
                  </p>
                  <p className="text-[11px] text-slate-500">Up to 10MB per document</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20 text-sm"
            >
              {loading ? 'Performing OCR & Cross-Document Inspection...' : 'Analyze Document Readiness'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Readiness Analysis Report */}
        {analysis && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Pre-Application Readiness Report</h3>
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                analysis.overall_status === 'READY_FOR_APPLICATION'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {analysis.overall_status?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Documents identified */}
            {analysis.documents_found?.length > 0 && (
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-300">Identified Certificates:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.documents_found.map((doc: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700"
                    >
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Issues detected */}
            {analysis.issues?.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-xs text-slate-200">Discrepancies & Warnings:</span>
                <div className="space-y-2">
                  {analysis.issues.map((iss: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1"
                    >
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        [{iss.type}] {iss.description}
                      </div>
                      {iss.recommendation && (
                        <p className="text-slate-300 pl-5">
                          Action: {iss.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended corrections */}
            {analysis.recommended_corrections?.length > 0 && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-200">Recommended Next Steps:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {analysis.recommended_corrections.map((corr: string, idx: number) => (
                    <li key={idx}>{corr}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.disclaimer && (
              <div className="p-3 rounded-xl bg-slate-950 text-[11px] text-slate-400 border border-slate-800">
                <strong>Disclaimer: </strong> {analysis.disclaimer}
              </div>
            )}
          </div>
        )}

        {/* User's Document Vault */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200">Uploaded Document Audit History</h3>
            <span className="text-xs text-slate-500">Citizen Data Sovereignty Guaranteed</span>
          </div>

          {savedDocs.length > 0 ? (
            <div className="space-y-2">
              {savedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{doc.filename}</p>
                    <p className="text-[11px] text-slate-400">
                      Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">
              No saved document reports in your private vault.
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

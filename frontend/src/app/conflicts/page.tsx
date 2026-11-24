'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { conflicts } from '@/lib/api';
import {
  AlertTriangle,
  ExternalLink,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function ConflictsPage() {
  const [conflictList, setConflictList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newConflict, setNewConflict] = useState({
    scheme_key: 'pm-kisan',
    source_a_name: '',
    source_a_url: '',
    source_a_content: '',
    source_a_date: '',
    source_b_name: '',
    source_b_url: '',
    source_b_content: '',
    source_b_date: '',
    conflict_description: '',
    conflict_field: 'income_limit',
  });

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      const data: any = await conflicts.list();
      setConflictList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await conflicts.report(newConflict);
      setShowModal(false);
      await loadConflicts();
    } catch (err: any) {
      alert(err.message || 'Report failed');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Multi-Source Cross-Verification</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Government Information Conflict Detector
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When two official or news sources disagree on income limits or age eligibility, SchemeSaathi transparently displays both with dates rather than silently guessing a winner.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Report Discrepancy
          </button>
        </div>

        {/* Conflicts List */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Auditing official conflicting records...
          </div>
        ) : conflictList.length > 0 ? (
          <div className="space-y-6">
            {conflictList.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      {c.conflict_field.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-white text-sm capitalize">
                      {c.scheme_key.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Status: <strong className="text-amber-400">{c.verified ? 'Resolved by Admin' : 'Active Discrepancy'}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {c.conflict_description}
                </p>

                {/* Side-by-side sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source A */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{c.source_a_name}</span>
                      {c.source_a_date && (
                        <span className="text-[11px] text-slate-500">{c.source_a_date}</span>
                      )}
                    </div>
                    <p className="text-slate-300 italic">"{c.source_a_content}"</p>
                    {c.source_a_url && (
                      <a
                        href={c.source_a_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        Official Source Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Source B */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{c.source_b_name}</span>
                      {c.source_b_date && (
                        <span className="text-[11px] text-slate-500">{c.source_b_date}</span>
                      )}
                    </div>
                    <p className="text-slate-300 italic">"{c.source_b_content}"</p>
                    {c.source_b_url && (
                      <a
                        href={c.source_b_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-rose-400 hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        Secondary Source Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {c.admin_resolution && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong>Admin Verification Resolution: </strong> {c.admin_resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm rounded-xl bg-slate-900/40 border border-slate-800">
            No contradictory information records currently flagged.
          </div>
        )}

        {/* Report Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
              <h3 className="text-base font-bold text-white">Report Source Contradiction</h3>
              <form onSubmit={handleReport} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Scheme Key</label>
                  <input
                    type="text"
                    required
                    value={newConflict.scheme_key}
                    onChange={(e) => setNewConflict({ ...newConflict, scheme_key: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Conflicting Field</label>
                  <input
                    type="text"
                    value={newConflict.conflict_field}
                    onChange={(e) => setNewConflict({ ...newConflict, conflict_field: e.target.value })}
                    placeholder="income_limit / eligibility_age"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Source A Name"
                    value={newConflict.source_a_name}
                    onChange={(e) => setNewConflict({ ...newConflict, source_a_name: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Source A URL"
                    value={newConflict.source_a_url}
                    onChange={(e) => setNewConflict({ ...newConflict, source_a_url: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Statement in Source A"
                  value={newConflict.source_a_content}
                  onChange={(e) => setNewConflict({ ...newConflict, source_a_content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Source B Name"
                    value={newConflict.source_b_name}
                    onChange={(e) => setNewConflict({ ...newConflict, source_b_name: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Source B URL"
                    value={newConflict.source_b_url}
                    onChange={(e) => setNewConflict({ ...newConflict, source_b_url: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Statement in Source B"
                  value={newConflict.source_b_content}
                  onChange={(e) => setNewConflict({ ...newConflict, source_b_content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />

                <textarea
                  rows={2}
                  required
                  placeholder="Describe the discrepancy..."
                  value={newConflict.conflict_description}
                  onChange={(e) => setNewConflict({ ...newConflict, conflict_description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

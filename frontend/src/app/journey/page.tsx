'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { journey, schemes } from '@/lib/api';
import {
  Milestone,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const STAGES = [
  'SCHEME_DISCOVERED',
  'ELIGIBILITY_CHECKED',
  'DOCUMENTS_IDENTIFIED',
  'DOCUMENTS_PREPARED',
  'APPLICATION_READY',
  'APPLICATION_SUBMITTED',
  'AWAITING_RESPONSE',
  'APPROVED_REJECTED',
  'RENEWAL_REQUIRED',
];

export default function JourneyTrackerPage() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [allSchemes, setAllSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemeKey, setSelectedSchemeKey] = useState('');
  const [notes, setNotes] = useState('');
  const [stageNotes, setStageNotes] = useState('');
  const [confirmationCheckbox, setConfirmationCheckbox] = useState(false);
  const [activeJourneyForUpdate, setActiveJourneyForUpdate] = useState<any>(null);
  const [targetStage, setTargetStage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jList, sList]: any = await Promise.all([journey.list(), schemes.list()]);
      setJourneys(jList || []);
      setAllSchemes(sList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeKey) return;
    const sch = allSchemes.find((s) => s.scheme_key === selectedSchemeKey);
    try {
      await journey.create({
        scheme_key: selectedSchemeKey,
        scheme_name: sch?.name || selectedSchemeKey,
        notes: notes || undefined,
      });
      setSelectedSchemeKey('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to start journey');
    }
  };

  const handleStageUpdate = async () => {
    if (!activeJourneyForUpdate || !targetStage) return;
    try {
      await journey.updateStage(
        activeJourneyForUpdate.id,
        targetStage,
        stageNotes,
        confirmationCheckbox
      );
      setActiveJourneyForUpdate(null);
      setStageNotes('');
      setConfirmationCheckbox(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to advance stage');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this scheme from journey tracker?')) return;
    try {
      await journey.remove(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <Milestone className="w-3.5 h-3.5" />
            <span>9-Stage State Machine · Zero Status Fabrication</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Application Journey Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Follows your scheme application step-by-step from discovery to approval. In strict compliance with civic transparency, we never fabricate government portal statuses.
          </p>
        </div>

        {/* Start Journey Form */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white">Track an Application Journey</h2>
          <form onSubmit={handleStartJourney} className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedSchemeKey}
              onChange={(e) => setSelectedSchemeKey(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">Select a scheme to track...</option>
              {allSchemes.map((s) => (
                <option key={s.scheme_key} value={s.scheme_key}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Application reference / personal notes (optional)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!selectedSchemeKey}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs"
            >
              Start Tracking
            </button>
          </form>
        </div>

        {/* Active Journeys */}
        {journeys.length > 0 ? (
          <div className="space-y-4">
            {journeys.map((j) => {
              const currentStageIdx = STAGES.indexOf(j.current_stage);
              return (
                <div
                  key={j.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-white">{j.scheme_name}</h3>
                      <p className="text-xs text-slate-400">
                        Current Milestone:{' '}
                        <span className="text-cyan-300 font-semibold uppercase">
                          {j.current_stage.replace(/_/g, ' ')}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveJourneyForUpdate(j);
                          setTargetStage(STAGES[Math.min(currentStageIdx + 1, STAGES.length - 1)]);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
                      >
                        Advance Milestone
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 9-Stage Visual Progress Bar */}
                  <div className="overflow-x-auto pb-2">
                    <div className="flex items-center min-w-[700px] text-[10px]">
                      {STAGES.map((stg, idx) => {
                        const isDone = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        return (
                          <React.Fragment key={stg}>
                            <div className="flex flex-col items-center flex-1">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 transition ${
                                  isDone
                                    ? 'bg-emerald-500 text-slate-950'
                                    : isCurrent
                                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-center truncate px-1 max-w-[80px] ${
                                  isCurrent
                                    ? 'text-cyan-300 font-bold'
                                    : isDone
                                    ? 'text-emerald-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {stg.split('_')[0]}
                              </span>
                            </div>
                            {idx < STAGES.length - 1 && (
                              <div
                                className={`h-0.5 flex-1 ${
                                  idx < currentStageIdx ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm rounded-2xl bg-slate-900/40 border border-slate-800">
            No active scheme journeys tracked yet. Start tracking above!
          </div>
        )}

        {/* Milestone Advance Modal */}
        {activeJourneyForUpdate && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-base font-bold text-white">
                Advance Stage: {activeJourneyForUpdate.scheme_name}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Milestone</label>
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Notes</label>
                  <textarea
                    rows={2}
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="e.g. Submitted at Village Secretariat with acknowledgment receipt"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {(targetStage === 'APPLICATION_SUBMITTED' || targetStage === 'APPROVED_REJECTED') && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-2">
                    <p className="font-semibold">Explicit Confirmation Required</p>
                    <label className="flex items-start gap-2 text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={confirmationCheckbox}
                        onChange={(e) => setConfirmationCheckbox(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-800 border-slate-700 text-cyan-500"
                      />
                      <span>
                        I confirm this status matches actual official action taken or receipt received. SchemeSaathi does not fabricate official responses.
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveJourneyForUpdate(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStageUpdate}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                  >
                    Confirm Milestone
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

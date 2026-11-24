'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { monitor } from '@/lib/api';
import { History, Calendar, ExternalLink, ArrowRight } from 'lucide-react';

export default function MonitorPage() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    monitor.getChanges().then((data: any) => {
      setChanges(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Audited Policy Timeline</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Government Scheme Change Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Tracks real historical policy amendments, benefit revisions, and eligibility criteria adjustments over time across central ministries and state gazettes.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading official revision log...
          </div>
        ) : changes.length > 0 ? (
          <div className="space-y-4">
            {changes.map((ch) => (
              <div
                key={ch.id}
                className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {ch.scheme_key.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      Field: {ch.change_field.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {ch.effective_date && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Effective Date: {ch.effective_date}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {ch.change_description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Prior Guideline</span>
                    <span className="text-rose-400 font-medium line-through">{ch.old_value || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Amended Guideline</span>
                    <span className="text-emerald-400 font-semibold">{ch.new_value || 'Active Rule'}</span>
                  </div>
                </div>

                {ch.source_url && (
                  <div className="pt-2 text-right">
                    <a
                      href={ch.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      Gazette Notification / Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm rounded-xl bg-slate-900/40 border border-slate-800">
            No policy changes logged yet.
          </div>
        )}
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { admin } from '@/lib/api';
import {
  ShieldCheck,
  Users,
  FileText,
  AlertTriangle,
  History,
  CheckCircle,
  Plus
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sData, uData, lData]: any = await Promise.all([
        admin.stats(),
        admin.users(),
        admin.logs()
      ]);
      setStats(sData);
      setUsers(uData || []);
      setLogs(lData || []);
    } catch (err: any) {
      setError(err.message || 'Access denied or admin privileges required');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Protected Administration Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            SchemeSaathi Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Server-side verified role authorization. Audit system records, manage scheme dataset, and verify reported conflicts.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            {error} (Note: To access admin routes, your profile must have role='admin' in Supabase).
          </div>
        )}

        {/* Real Metrics from database */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400">Total Schemes</span>
              <p className="text-2xl font-bold text-cyan-300 mt-1">{stats.schemes}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400">Registered Citizens</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.users}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400">Pending Conflicts</span>
              <p className="text-2xl font-bold text-amber-300 mt-1">{stats.unresolved_conflicts}</p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
              <span className="text-xs text-slate-400">Scam Reports</span>
              <p className="text-2xl font-bold text-rose-400 mt-1">{stats.scam_reports}</p>
            </div>
          </div>
        )}

        {/* Citizen Users Table */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Registered Citizen Profiles</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Email</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-medium text-white">{u.email}</td>
                    <td className="p-3">{u.full_name || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.state || 'N/A'}</td>
                    <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Audit Trail Logs */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Admin Actions Audit Trail</span>
          </h2>
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((lg) => (
                <div
                  key={lg.id}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-cyan-300 uppercase">[{lg.action}]</span>{' '}
                    <span className="text-slate-300">{lg.resource_type}: {lg.resource_id}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(lg.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No audit logs recorded yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { family, schemes } from '@/lib/api';
import { StatusBadge, TrustBadge } from '@/components/ui/Badge';
import {
  Users,
  UserPlus,
  Trash2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus
} from 'lucide-react';

export default function FamilyBenefitFinderPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [finderReport, setFinderReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: 'father',
    age: 40,
    gender: 'male',
    occupation: '',
    annual_income: 0,
    is_farmer: false,
    is_student: false,
    has_disability: false,
    category: 'OBC',
  });

  useEffect(() => {
    loadFamily();
  }, []);

  const loadFamily = async () => {
    try {
      setLoading(true);
      const data: any = await family.list();
      setMembers(data || []);
      if (data && data.length > 0) {
        runFinder();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seedDemo = async () => {
    try {
      setLoading(true);
      await family.seedDemo();
      await loadFamily();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runFinder = async () => {
    try {
      setEvaluating(true);
      const report: any = await schemes.familyBenefitFinder();
      setFinderReport(report);
    } catch (err) {
      console.error('Finder error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await family.add(newMember);
      setShowAddModal(false);
      setNewMember({
        name: '',
        relation: 'father',
        age: 40,
        gender: 'male',
        occupation: '',
        annual_income: 0,
        is_farmer: false,
        is_student: false,
        has_disability: false,
        category: 'OBC',
      });
      await loadFamily();
    } catch (err: any) {
      alert(err.message || 'Failed to add member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    try {
      await family.remove(id);
      await loadFamily();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independent Evaluation · No Cross-Leakage</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Family Benefit Finder
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Evaluates every household member independently. Identifies individual entitlements, shared benefits, and prevents fraudulent cross-transfer of eligibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={seedDemo}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              Reset 4-Member Demo Family
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {/* 4-Member Demo Banner reminder if demo is loaded */}
        {members.some((m) => m.is_demo) && (
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                Demonstration Family loaded: <strong>Father (45, Farmer)</strong>, <strong>Mother (40, Homemaker)</strong>, <strong>Daughter (19, Student)</strong>, and <strong>Grandfather (70, Senior)</strong>.
              </span>
            </div>
            <button
              onClick={runFinder}
              disabled={evaluating}
              className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
            >
              {evaluating ? 'Evaluating...' : 'Re-run Evaluation'}
            </button>
          </div>
        )}

        {/* Household Member Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{member.name}</h3>
                    <p className="text-xs text-slate-400 capitalize">
                      {member.relation} · {member.age} yrs
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-slate-600 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-[11px] text-slate-300">
                  <p>Occupation: <span className="font-semibold">{member.occupation || 'N/A'}</span></p>
                  <p>Category: <span className="font-semibold">{member.category || 'General'}</span></p>
                  <p>Income: <span className="font-semibold">Rs {member.annual_income?.toLocaleString() || 0}</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                {member.is_farmer && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Farmer
                  </span>
                )}
                {member.is_student && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Student
                  </span>
                )}
                {member.is_demo && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Demo Member
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Independent Evaluation Results per Member */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Independent Household Eligibility Matrix
          </h2>

          {evaluating ? (
            <div className="p-8 text-center text-slate-400 text-sm rounded-xl bg-slate-900/40 border border-slate-800">
              Evaluating eligibility for each household member...
            </div>
          ) : finderReport?.member_reports?.length ? (
            <div className="space-y-4">
              {finderReport.member_reports.map((rep: any) => (
                <div
                  key={rep.member_id}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{rep.name}</h3>
                      <span className="text-xs text-slate-400 capitalize">
                        ({rep.relation}, {rep.age} yrs)
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      {rep.eligible_count} Potentially Eligible Schemes
                    </span>
                  </div>

                  {rep.eligible_schemes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rep.eligible_schemes.map((sch: any) => (
                        <div
                          key={sch.scheme_key}
                          className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-slate-200 text-sm">{sch.scheme_name}</h4>
                            <TrustBadge trustLabel={sch.trust_label} />
                          </div>
                          {sch.benefit_estimate && (
                            <p className="text-xs text-emerald-300 font-medium">
                              Benefit: {sch.benefit_estimate}
                            </p>
                          )}
                          {sch.reasons?.length > 0 && (
                            <p className="text-[11px] text-slate-400">
                              Reason: {sch.reasons.join('; ')}
                            </p>
                          )}
                          {sch.official_url && (
                            <a
                              href={sch.official_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                            >
                              <span>Official Application Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No matching verified schemes identified based on member profile.
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm rounded-xl bg-slate-900/40 border border-slate-800">
              Add family members or click 'Reset 4-Member Demo Family' to run the evaluation.
            </div>
          )}
        </div>

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-white">Add Household Member</h3>
              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Ramesh"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Relation</label>
                    <select
                      value={newMember.relation}
                      onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="spouse">Spouse</option>
                      <option value="grandfather">Grandfather</option>
                      <option value="grandmother">Grandmother</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={120}
                      value={newMember.age}
                      onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Occupation</label>
                    <input
                      type="text"
                      value={newMember.occupation}
                      onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                      placeholder="farmer / student"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Annual Income (₹)</label>
                    <input
                      type="number"
                      value={newMember.annual_income}
                      onChange={(e) => setNewMember({ ...newMember, annual_income: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={newMember.is_farmer}
                      onChange={(e) => setNewMember({ ...newMember, is_farmer: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                    <span>Is Farmer</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={newMember.is_student}
                      onChange={(e) => setNewMember({ ...newMember, is_student: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                    <span>Is Student</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Add Member
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

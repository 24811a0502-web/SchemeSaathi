'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { profile } from '@/lib/api';
import { User, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [form, setForm] = useState({
    full_name: '',
    age: 45,
    gender: 'male',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    annual_income: 80000,
    occupation: 'farmer',
    education: 'secondary',
    family_size: 4,
    category: 'OBC',
    is_farmer: true,
    is_student: false,
    has_disability: false,
    phone: '',
    preferred_language: 'en',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    profile.get().then((data: any) => {
      if (data) {
        setForm((prev) => ({
          ...prev,
          full_name: data.full_name || prev.full_name,
          age: data.age || prev.age,
          gender: data.gender || prev.gender,
          state: data.state || prev.state,
          district: data.district || prev.district,
          annual_income: data.annual_income || prev.annual_income,
          occupation: data.occupation || prev.occupation,
          education: data.education || prev.education,
          family_size: data.family_size || prev.family_size,
          category: data.category || prev.category,
          is_farmer: data.is_farmer ?? prev.is_farmer,
          is_student: data.is_student ?? prev.is_student,
          has_disability: data.has_disability ?? prev.has_disability,
          phone: data.phone || prev.phone,
          preferred_language: data.preferred_language || prev.preferred_language,
        }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profile.update(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Citizen Profile Master Record</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            User Demographics & Scheme Parameters
          </h1>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            These parameters feed directly into the deterministic rule engine to discover entitled benefits across central and state welfare departments.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile successfully updated! Reverse Matchmaker will reflect the changes.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Annual Household Income (₹)</label>
              <input
                type="number"
                value={form.annual_income}
                onChange={(e) => setForm({ ...form, annual_income: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Social Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="Minority">Minority</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Education Level</label>
              <input
                type="text"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                placeholder="secondary / graduate"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5 pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={form.is_farmer}
                onChange={(e) => setForm({ ...form, is_farmer: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500"
              />
              <span>Farmer / Cultivator</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={form.is_student}
                onChange={(e) => setForm({ ...form, is_student: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500"
              />
              <span>Enrolled Student</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={form.has_disability}
                onChange={(e) => setForm({ ...form, has_disability: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500"
              />
              <span>Person with Disability (PwD)</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

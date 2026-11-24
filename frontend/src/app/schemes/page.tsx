'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { schemes } from '@/lib/api';
import { StatusBadge, TrustBadge } from '@/components/ui/Badge';
import {
  Search,
  Filter,
  ExternalLink,
  Phone,
  Calendar,
  CheckCircle,
  FileText,
  ArrowRight
} from 'lucide-react';

export default function SchemesPage() {
  const [schemeList, setSchemeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    fetchSchemes();
  }, [selectedState]);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedState !== 'all') {
        params.state = selectedState;
      }
      const data: any = await schemes.list(params);
      setSchemeList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemeList.filter((s) => {
    const matchesSearch =
      search.trim() === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.scheme_key.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      selectedTag === 'all' || (s.tags && s.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Curated Government Scheme Discovery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verified starter dataset spanning Central Government and Andhra Pradesh welfare programs with full evidence citations.
          </p>
        </div>

        {/* Filter controls */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, benefits, keywords..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* State filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Region:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="all">All India + States</option>
                <option value="All India">Central Schemes</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
            </div>

            {/* Tag filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Category:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="all">All Categories</option>
                <option value="agriculture">Agriculture & Farmers</option>
                <option value="education">Education & Students</option>
                <option value="healthcare">Healthcare & Insurance</option>
                <option value="housing">Housing (Rural/Urban)</option>
                <option value="women">Women & Child</option>
                <option value="senior-citizen">Senior Citizens</option>
                <option value="pension">Social Security & Pension</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Retrieving verified scheme catalog...
          </div>
        ) : filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                        {scheme.applicable_state}
                      </span>
                      <h2 className="font-bold text-base text-white mt-1.5">{scheme.name}</h2>
                    </div>
                    <TrustBadge trustLabel={scheme.verification_status} />
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {scheme.description}
                  </p>

                  {scheme.benefits && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      <span className="font-semibold">Benefits: </span>
                      {scheme.benefits}
                    </div>
                  )}

                  {scheme.required_documents && scheme.required_documents.length > 0 && (
                    <div className="text-xs text-slate-400 space-y-1">
                      <span className="font-medium text-slate-300">Required Documents:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scheme.required_documents.map((doc: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer metadata & buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    {scheme.last_verified && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Verified: {scheme.last_verified}
                      </span>
                    )}
                    {scheme.helpline && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {scheme.helpline}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/eligibility?scheme=${scheme.scheme_key}`}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-semibold border border-cyan-500/30 transition text-xs"
                    >
                      Check Eligibility
                    </Link>
                    {scheme.official_url && (
                      <a
                        href={scheme.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Official Government Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm rounded-xl bg-slate-900/30 border border-slate-800">
            No government schemes matched the selected criteria.
          </div>
        )}
      </div>
    </AppLayout>
  );
}

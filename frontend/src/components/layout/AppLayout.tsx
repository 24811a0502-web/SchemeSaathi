'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  Users,
  CheckCircle2,
  ShieldAlert,
  FileCheck,
  FileText,
  GitCompare,
  Milestone,
  History,
  AlertTriangle,
  FileSpreadsheet,
  User,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation: NavItem[] = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('agent'), href: '/agent', icon: MessageSquare, badge: 'AI' },
    { name: t('schemes'), href: '/schemes', icon: Search },
    { name: t('family'), href: '/family', icon: Users, badge: 'Demo' },
    { name: t('eligibility'), href: '/eligibility', icon: CheckCircle2 },
    { name: t('scam'), href: '/scam', icon: ShieldAlert, badge: 'Vision' },
    { name: t('documents'), href: '/documents', icon: FileCheck },
    { name: t('simplifier'), href: '/simplifier', icon: FileText },
    { name: t('compare'), href: '/compare', icon: GitCompare },
    { name: t('journey'), href: '/journey', icon: Milestone },
    { name: t('monitor'), href: '/monitor', icon: History },
    { name: t('conflicts'), href: '/conflicts', icon: AlertTriangle },
    { name: t('reports'), href: '/reports', icon: FileSpreadsheet },
    { name: t('profile'), href: '/profile', icon: User },
    { name: t('settings'), href: '/settings', icon: SettingsIcon },
    { name: t('admin'), href: '/admin', icon: ShieldCheck, badge: 'Role' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            SS
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            SchemeSaathi
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 rounded p-0.5 text-xs">
            {(['en', 'te', 'hi'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => setLanguage(lng)}
                className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
                  language === lng ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-40 bg-slate-950 flex flex-col' : 'hidden'
        } md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-800 bg-slate-950/95 backdrop-blur z-30`}
      >
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/25">
              SS
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                SchemeSaathi
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Civic AI Assistant</p>
            </div>
          </Link>
        </div>

        {/* User bar & Language switcher */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Language</span>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              {(['en', 'te', 'hi'] as const).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    language === lng
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-300 truncate">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate">{user.full_name || user.email}</span>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    item.badge === 'AI' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    item.badge === 'Demo' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-400" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}

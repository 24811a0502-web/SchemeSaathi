'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'te' | 'hi';

const TRANSLATIONS = {
  en: {
    dashboard: 'Dashboard',
    schemes: 'Scheme Discovery',
    family: 'Family Benefit Finder',
    eligibility: 'Eligibility Checker',
    agent: 'AI Civic Agent',
    scam: 'Scam Detection',
    documents: 'Document Intelligence',
    simplifier: 'PDF Simplifier',
    compare: 'Scheme Comparison',
    journey: 'Application Journey',
    monitor: 'Scheme Monitor',
    conflicts: 'Conflict Detector',
    reports: 'Citizen Reports',
    profile: 'Profile',
    settings: 'Settings',
    admin: 'Admin Dashboard',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    welcome: 'Welcome to SchemeSaathi',
    tagline: 'Your Personal Government Scheme Assistant',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    schemes: 'పథకాల అన్వేషణ',
    family: 'కుటుంబ ప్రయోజన కనుగొనేవారు',
    eligibility: 'అర్హత తనిఖీ',
    agent: 'AI పౌర ఏజెంట్',
    scam: 'మోసం గుర్తింపు',
    documents: 'పత్రాల విశ్లేషణ',
    simplifier: 'PDF సరళీకరించడం',
    compare: 'పథకాల పోలిక',
    journey: 'దరఖాస్తు ప్రయాణం',
    monitor: 'పథకాల మానిటర్',
    conflicts: 'వైరుధ్య గుర్తింపు',
    reports: 'పౌర నివేదికలు',
    profile: 'ప్రొఫైల్',
    settings: 'సెట్టింగ్‌లు',
    admin: 'అడ్మిన్ డాష్‌బోర్డ్',
    logout: 'లాగ్అవుట్',
    login: 'లాగిన్',
    signup: 'సైన్ అప్',
    welcome: 'స్కీమ్ సాథికి స్వాగతం',
    tagline: 'మీ వ్యక్తిగత ప్రభుత్వ పథక సహాయకుడు',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    schemes: 'योजना खोज',
    family: 'पारिवारिक लाभ खोजक',
    eligibility: 'पात्रता जाँच',
    agent: 'AI नागरिक सहायक',
    scam: 'धोखाधड़ी पहचान',
    documents: 'दस्तावेज़ बुद्धिमत्ता',
    simplifier: 'PDF सरलीकरण',
    compare: 'योजना तुलना',
    journey: 'आवेदन यात्रा',
    monitor: 'योजना मॉनिटर',
    conflicts: 'विरोधाभास पहचानकर्ता',
    reports: 'नागरिक रिपोर्ट',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    admin: 'व्यवस्थापक डैशबोर्ड',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    signup: 'साइन अप',
    welcome: 'स्कीम साथी में आपका स्वागत है',
    tagline: 'आपका व्यक्तिगत सरकारी योजना सहायक',
  },
};

interface LangContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LangContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoice } from '@/hooks/useVoice';
import { agent, profile } from '@/lib/api';
import { TrustBadge } from '@/components/ui/Badge';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { name: string; url: string }[];
  trust_label?: string;
  eligibility_context?: string;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  'Am I eligible for PM-KISAN if our family earns Rs 80,000?',
  'What documents are required for AP YSR Rythu Bharosa?',
  'Tell me about scholarship schemes for college students in Andhra Pradesh',
  'What is the age requirement and benefit amount for old age pension (IGNOAPS)?',
];

export default function AgentPage() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isListening, transcript, isSpeaking, supported, startListening, stopListening, speak, stopSpeaking } = useVoice();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaste! I am SchemeSaathi Civic AI. I answer questions regarding Indian Central & Andhra Pradesh government schemes using verified official sources and our deterministic eligibility engine. How can I assist your family today?',
      trust_label: 'Officially Sourced',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    profile.get().then(setProfileData).catch(() => {});
  }, []);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response: any = await agent.chat({
        message: question,
        language: language,
        age: profileData?.age,
        state: profileData?.state,
        annual_income: profileData?.annual_income,
        occupation: profileData?.occupation,
        is_farmer: profileData?.is_farmer,
        is_student: profileData?.is_student,
        category: profileData?.category,
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        trust_label: response.trust_label,
        eligibility_context: response.eligibility_context,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to retrieve answer. Please try again.'}`,
        trust_label: 'Unverified',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto w-full">
        {/* Header bar */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base">AI Civic Agent</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  Grounded RAG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic eligibility evaluation · Zero hallucinations on government rules
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 rounded-lg p-1 text-xs">
              {(['en', 'te', 'hi'] as const).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    language === lng ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat message history container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.eligibility_context && (
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                    <span className="font-semibold">Deterministic Profile Match: </span>
                    {msg.eligibility_context}
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {msg.trust_label && <TrustBadge trustLabel={msg.trust_label} />}
                      <span className="text-slate-500 text-[11px]">{msg.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {supported && (
                        <button
                          onClick={() => (isSpeaking ? stopSpeaking() : speak(msg.content, language))}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400"
                          title="Read aloud"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-300">Official Citations:</div>
                    {msg.sources.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 truncate">
                        <ExternalLink className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline truncate"
                        >
                          {s.name || s.url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 text-white animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Checking verified government repositories and deterministic rules...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto text-xs text-slate-400 scrollbar-none">
          <span className="flex-shrink-0 font-medium text-slate-500">Suggested:</span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 mt-2">
          {supported && (
            <button
              onClick={handleVoiceToggle}
              className={`p-2.5 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input (Speech API)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : language === 'te'
                ? 'ప్రభుత్వ పథకం గురించి ఏదైనా అడగండి...'
                : language === 'hi'
                ? 'सरकारी योजना के बारे में कुछ भी पूछें...'
                : 'Ask about any government scheme, eligibility condition, or benefits...'
            }
            className="flex-1 bg-transparent border-0 px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

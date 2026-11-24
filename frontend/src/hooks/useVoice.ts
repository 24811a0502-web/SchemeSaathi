'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSupported(!!SR && 'speechSynthesis' in window);
    }
  }, []);

  const startListening = useCallback((language: string = 'en') => {
    if (!supported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SR();
    const rec = recognitionRef.current;

    const langMap: Record<string, string> = {
      en: 'en-IN',
      te: 'te-IN',
      hi: 'hi-IN',
    };

    rec.lang = langMap[language] || 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
    };

    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    rec.start();
    setIsListening(true);
    setTranscript('');
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, language: string = 'en') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const langMap: Record<string, string> = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, transcript, isSpeaking, supported, startListening, stopListening, speak, stopSpeaking };
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  content: string;
  language: string;
  title?: string;
}

const LANG_MAP: Record<string, string> = {
  English: 'en-US',
  Gujarati: 'gu-IN',
  Hindi: 'hi-IN',
  'English (US)': 'en-US',
};

export function SpeakerButton({ content, language, title }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech.');
      return;
    }

    // Stop any current
    window.speechSynthesis.cancel();

    // Use raw markdown-ish text; browsers handle reasonably. Strip basic md for better speak.
    const plain = (content || '')
      .replace(/[#*_`>\[\]!()-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!plain) return;

    const u = new SpeechSynthesisUtterance(`${title ? title + '. ' : ''}${plain}`);
    const voiceLang = LANG_MAP[language] || 'en-US';
    u.lang = voiceLang;
    u.rate = 0.95;
    u.pitch = 1.0;

    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);

    setUtterance(u);
    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <Button
      type="button"
      variant={isPlaying ? 'secondary' : 'primary'}
      className="text-sm"
      onClick={isPlaying ? stop : speak}
      title={isPlaying ? 'Stop reading' : `Listen in ${language}`}
    >
      {isPlaying ? '■ Stop' : '🔊 Listen'}
    </Button>
  );
}

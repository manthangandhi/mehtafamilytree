'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  content: string;
  language: string;
  title?: string;
  className?: string;
}

const LANG_MAP: Record<string, string> = {
  English: 'en-US',
  Gujarati: 'gu-IN',
  Hindi: 'hi-IN',
  'English (US)': 'en-US',
};

export function SpeakerButton({ content, language, title, className }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices (important - they load asynchronously)
  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs.length) setVoices(vs);
    };

    loadVoices();

    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech.');
      return;
    }

    // Stop any current
    window.speechSynthesis.cancel();

    // IMPORTANT: Read the *currently visible text* from the DOM.
    // This gets whatever Google Translate has translated the page to (in the selected language).
    // The `content` prop is the original server text (often English), so we must use the live DOM.
    let textToSpeak = (content || '').replace(/[#*_`>\[\]!()-]/g, ' ').replace(/\s+/g, ' ').trim();
    let speakTitle = title || '';

    try {
      // Get the translated title from the green header h1
      const headerH1 = document.querySelector('h1') as HTMLElement | null;
      if (headerH1) {
        speakTitle = headerH1.innerText.trim();
      }

      // Get the translated article content
      const article = (document.querySelector('article.prose-heritage') || document.querySelector('article')) as HTMLElement | null;
      if (article) {
        textToSpeak = article.innerText.trim();
      }
    } catch (e) {
      // fallback to original content prop
    }

    if (!textToSpeak) return;

    const u = new SpeechSynthesisUtterance(`${speakTitle ? speakTitle + '. ' : ''}${textToSpeak}`);

    // Detect the *currently selected language from the dropdown* at click time.
    let voiceLang = 'en-US';

    // 1. Try Google combo (live from header dropdown)
    try {
      const findCombo = () => document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      let select = findCombo();
      let gLang = (select?.value || '').toLowerCase().trim();

      if (!gLang) {
        for (let i = 0; i < 5; i++) {
          const start = Date.now();
          while (Date.now() - start < 20) {}
          select = findCombo();
          gLang = (select?.value || '').toLowerCase().trim();
          if (gLang) break;
        }
      }

      if (gLang === 'gu') voiceLang = 'gu-IN';
      else if (gLang === 'hi') voiceLang = 'hi-IN';
      else if (gLang === 'en') voiceLang = 'en-US';
    } catch {}

    // 2. Fallback to the page's declared language (if combo query somehow missed)
    // Note: primary detection is from the dropdown's .goog-te-combo value

    // 3. Fallback to page's declared language
    if (voiceLang === 'en-US' && language) {
      voiceLang = LANG_MAP[language] || 'en-US';
    }

    u.lang = voiceLang;
    u.rate = (voiceLang.startsWith('gu') || voiceLang.startsWith('hi')) ? 0.9 : 0.95;  // slightly slower for better Indian lang clarity
    u.pitch = 1.0;

    // *** KEY FIX: Explicitly pick a matching voice ***
    // Browsers often ignore .lang unless you also set .voice to a real installed voice.
    // Force a fresh voices list on user click (voices load async).
    window.speechSynthesis.getVoices();
    let currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    const prefix = voiceLang.toLowerCase().split('-')[0];

    // For Gujarati, try multiple possible lang codes because browsers report them differently
    let possibleTargets = [voiceLang];
    if (voiceLang === 'gu-IN') {
      possibleTargets = ['gu-IN', 'gu', 'guj-IN', 'gu-GJ', 'gujarati'];
    } else if (voiceLang === 'hi-IN') {
      possibleTargets = ['hi-IN', 'hi', 'hindi'];
    } else if (voiceLang === 'en-US') {
      possibleTargets = ['en-US', 'en', 'en-GB'];
    }

    let matched: SpeechSynthesisVoice | undefined;

    const findVoice = (langCode: string) => {
      const lc = langCode.toLowerCase();
      const pre = lc.split('-')[0];

      // 1. Exact match on lang
      let v = currentVoices.find(v => v.lang.toLowerCase() === lc);
      if (v) return v;

      // 2. Lang starts with the prefix
      v = currentVoices.find(v => v.lang.toLowerCase().startsWith(pre + '-'));
      if (v) return v;

      // 3. Lang contains the prefix anywhere
      v = currentVoices.find(v => v.lang.toLowerCase().includes(pre));
      if (v) return v;

      // 4. Broad name search for Gujarati/Hindi/English (very important for Gujarati)
      const nameKeywords: Record<string, string[]> = {
        'en': ['english', 'samantha', 'karen', 'moira', 'tessa', 'google us', 'us english', 'en'],
        'hi': ['hindi', 'google hindi', 'हिन्दी', 'hi'],
        'gu': ['gujarati', 'google gujarati', 'ગુજરાતી', 'gujarati', 'guj', 'gu', 'gujarat'],
      };
      const keywords = nameKeywords[pre] || [pre];
      for (const kw of keywords) {
        v = currentVoices.find(v => 
          v.name.toLowerCase().includes(kw) || 
          v.lang.toLowerCase().includes(kw)
        );
        if (v) return v;
      }

      return undefined;
    };

    // Try all possible lang codes for this language
    for (const t of possibleTargets) {
      matched = findVoice(t);
      if (matched) break;
    }

    // If still no match for Gujarati, try any voice that might be Indian / non-English as last resort
    const guPrefix = voiceLang.toLowerCase().split('-')[0];
    if (!matched && (voiceLang.toLowerCase().startsWith('gu') || guPrefix === 'gu')) {
      matched = currentVoices.find(v => 
        !v.lang.toLowerCase().startsWith('en') && 
        (v.name.toLowerCase().includes('gu') || v.lang.toLowerCase().includes('gu') || v.lang.toLowerCase().includes('in'))
      );
    }

    // Special preference for English - change to a nicer voice (Samantha is natural on macOS)
    if (prefix === 'en' && matched) {
      const preferredEn = currentVoices.find(v => 
        v.lang.toLowerCase().startsWith('en') && 
        (v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('karen') ||
         v.name.toLowerCase().includes('google us english'))
      );
      if (preferredEn) matched = preferredEn;
    }

    if (matched) {
      u.voice = matched;
      u.lang = matched.lang;   // reinforce with the actual voice lang
    } else {
      // Still set the lang even if no perfect voice match (browser will do its best)
      u.lang = voiceLang;
    }

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
      className={`text-sm ${className || ''}`}
      onClick={isPlaying ? stop : speak}
      title={isPlaying ? 'Stop reading' : `Listen in current selected language`}
    >
      {isPlaying ? '■ Stop' : '🔊 Listen'}
    </Button>
  );
}

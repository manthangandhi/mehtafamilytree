"use client";

import { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";

export function GoogleTranslate() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "gu", label: "ગુજરાતી", short: "GU" },
    { code: "hi", label: "हिन्दी", short: "HI" }
  ];

  useEffect(() => {
    setIsMounted(true);

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    if (typeof window !== "undefined") {
      if (!(window as any).google || !(window as any).google.translate) {
        const script = document.createElement("script");
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);

        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            { 
              pageLanguage: "en",
              includedLanguages: "en,hi,gu",
              autoDisplay: false
            },
            "google_translate_element"
          );
        };
      }
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string, label: string) => {
    setCurrentLang(label);
    setIsOpen(false);
    
    // Find the hidden Google Translate select element and trigger a change
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
  };

  if (!isMounted) return <div className="h-9 w-[100px] bg-gray-100 rounded-full animate-pulse" />;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden container for the actual Google widget */}
      <div id="google_translate_element" className="hidden"></div>
      
      {/* Custom UI Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-primary/40 hover:bg-primary/5 rounded-full text-sm font-bold text-gray-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <Globe size={16} className="text-primary/70" />
        <span>{currentLang}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom UI Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in origin-top-right">
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code, lang.short)}
                className={`w-full text-left px-5 py-2.5 text-sm font-medium hover:bg-primary/5 transition-colors flex items-center justify-between ${currentLang === lang.short ? 'text-primary bg-primary/5' : 'text-gray-600'}`}
              >
                {lang.label}
                {currentLang === lang.short && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

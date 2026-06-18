'use client';

import React from 'react';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91 India' },
  { code: '+1', label: '🇺🇸 +1 USA / Canada' },
  { code: '+44', label: '🇬🇧 +44 UK' },
  { code: '+61', label: '🇦🇺 +61 Australia' },
  { code: '+971', label: '🇦🇪 +971 UAE' },
  { code: '+65', label: '🇸🇬 +65 Singapore' },
  { code: '+81', label: '🇯🇵 +81 Japan' },
  { code: '+86', label: '🇨🇳 +86 China' },
  { code: '+49', label: '🇩🇪 +49 Germany' },
];

export function PhoneInput({ label = 'Mobile', value, onChange, placeholder = 'Phone number', required }: PhoneInputProps) {
  // Parse existing value like "+91 9876543210" or "9876543210"
  const parseValue = (val: string) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return { code: '+91', number: '' };
    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      const found = COUNTRY_CODES.find(c => c.code === match[1]);
      return { code: found ? found.code : match[1], number: match[2] || '' };
    }
    return { code: '+91', number: trimmed };
  };

  const { code, number } = parseValue(value);

  const handleCodeChange = (newCode: string) => {
    const newVal = number ? `${newCode} ${number}` : newCode;
    onChange(newVal);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s()-]/g, '');
    const newVal = num ? `${code} ${num}` : code;
    onChange(newVal);
  };

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex gap-2">
        <select
          className="input w-[130px] text-sm"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
          {/* Allow custom if not in list */}
          {!COUNTRY_CODES.some(c => c.code === code) && (
            <option value={code}>{code}</option>
          )}
        </select>
        <input
          className="input flex-1"
          type="tel"
          value={number}
          onChange={handleNumberChange}
          placeholder={placeholder}
          required={required}
        />
      </div>
      <p className="text-[10px] text-muted mt-0.5">Country code + number saved together.</p>
    </div>
  );
}

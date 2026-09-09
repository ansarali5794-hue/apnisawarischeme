import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LanguageType, LANGUAGES, saveLanguage } from '../lib/translations';

interface LanguageDropdownProps {
  currentLang: LanguageType;
  onLangChange: (lang: LanguageType) => void;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  currentLang,
  onLangChange,
  className = '',
  variant = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode: LanguageType) => {
    onLangChange(langCode);
    saveLanguage(langCode);
    setIsOpen(false);
  };

  const buttonStyles = {
    light:
      'bg-white dark:bg-neutral-800 text-[#181c1c] dark:text-white border border-[#e0e3e2] dark:border-neutral-700 hover:border-[#98001b]',
    dark:
      'bg-[#181c1c] text-[#fed488] border border-[#fed488]/40 hover:border-[#fed488]',
    glass:
      'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30'
  };

  return (
    <div className={`relative text-left ${className || 'inline-block'}`} ref={dropdownRef}>
      <button
        id="btn-language-selector-dropdown"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${buttonStyles[variant]}`}
      >
        <Globe className="w-3.5 h-3.5 text-[#98001b] dark:text-[#fed488] shrink-0" />
        <span className="leading-none whitespace-nowrap">
          {currentLang === 'en' ? 'Language: English' : currentLang === 'sd' ? 'ٻولي: سنڌي' : 'زبان: اردو'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#98001b]' : 'text-neutral-500'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl bg-white dark:bg-[#1e2323] border border-[#e0e3e2] dark:border-neutral-700 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 border-b border-[#e0e3e2]/60 dark:border-neutral-700/60 mb-1 text-center">
            Select Language / زبان منتخب کریں
          </div>

          <div className="space-y-1">
            {(['sd', 'ur', 'en'] as LanguageType[]).map((code) => {
              const isActive = currentLang === code;
              const config = LANGUAGES[code];

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#98001b] text-white shadow-sm'
                      : 'text-[#181c1c] dark:text-neutral-200 hover:bg-[#f1f4f3] dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{config.nativeName}</span>
                    <span className={`text-[10px] ${isActive ? 'text-[#fed488]' : 'text-neutral-400'}`}>
                      ({config.label})
                    </span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#fed488] stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

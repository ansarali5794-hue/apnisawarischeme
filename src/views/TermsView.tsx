import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Check, Sparkles, ScrollText } from 'lucide-react';
import { EXACT_TERMS_SECTIONS } from '../data/mockData';
import { RegistrationFormData, TermSection } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';

interface TermsViewProps {
  onBack: () => void;
  pendingRegistrationData?: RegistrationFormData | null;
  onConfirmRegistration?: (data: RegistrationFormData) => void;
  isRegistrationFlow?: boolean;
  terms?: TermSection[];
  currentLang?: LanguageType;
}

export const TermsView: React.FC<TermsViewProps> = ({
  onBack,
  pendingRegistrationData,
  onConfirmRegistration,
  isRegistrationFlow = false,
  terms,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [isChecked, setIsChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeTerms = terms && (terms || []).length > 0 ? terms : EXACT_TERMS_SECTIONS;

  const handleAgreeAndContinue = () => {
    if (!isChecked) return;
    setIsProcessing(true);

    if (isRegistrationFlow && pendingRegistrationData && onConfirmRegistration) {
      setTimeout(() => {
        onConfirmRegistration(pendingRegistrationData);
      }, 500);
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        onBack();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#181c1c] text-[#181c1c] dark:text-white flex flex-col justify-between animate-in fade-in duration-300">
      {/* Sticky Clean Header */}
      <header className="sticky top-0 z-30 bg-[#98001b] text-white shadow-maroon">
        <div className="w-full max-w-[480px] mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            id="terms-back-btn"
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-white touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] text-[#fed488] font-bold tracking-wider uppercase block">
              {t.appTitle}
            </span>
            <h1 className="font-headline text-base sm:text-lg font-black text-white leading-tight">
              {t.termsTitle}
            </h1>
          </div>

          <div className="w-10 flex justify-end">
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-[#785a1a] shadow-gold border border-[#e9c176]">
              <ShieldCheck className="w-5 h-5 text-[#98001b]" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content Container */}
      <main className="flex-1 w-full max-w-[480px] mx-auto p-4 space-y-4 pb-36">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-[#181c1c] to-[#2d3131] text-white rounded-3xl p-4 sm:p-5 border border-[#fed488]/30 card-shadow flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl gold-gradient flex items-center justify-center text-[#785a1a] shrink-0 font-bold shadow-gold">
            <ScrollText className="w-5 h-5 text-[#98001b]" />
          </div>
          <div className="flex-1 text-right" dir="rtl">
            <p className="font-headline text-sm font-black text-[#fed488]">
              {t.welcomeBack}! اپنی سواری اسکیم
            </p>
            <p className="text-xs text-white/90 leading-relaxed mt-0.5 font-medium">
              {currentLang === 'sd'
                ? 'کاميٽي ۾ شامل ٿيڻ کان اڳ مهرباني ڪري سڀ شرطون غور سان پڙهو.'
                : 'اکاؤنٹ بنانے سے قبل براہ کرم درج ذیل تمام شرائط و ضوابط کو غور سے پڑھ کر اتفاق کریں۔'}
            </p>
          </div>
        </div>

        {/* Clauses Container */}
        <div className="space-y-3.5">
          {(activeTerms || []).map((section) => (
            <div
              key={section.number}
              className="bg-white dark:bg-[#2d3131] rounded-3xl p-4 sm:p-5 border border-[#f1e2e1] dark:border-neutral-700 card-shadow hover:border-[#98001b]/40 transition-colors"
            >
              {/* Header with Number and Title (RTL) */}
              <div className="flex items-center justify-between flex-row-reverse border-b border-[#e2e8f0] dark:border-neutral-700 pb-3 mb-3" dir="rtl">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#98001b] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                    {section.number}
                  </span>
                  <h2 className="font-headline font-black text-base text-[#98001b] dark:text-[#ffb3b0]">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Paragraphs in Urdu RTL */}
              <div className="space-y-2 text-right" dir="rtl">
                {(section.paragraphs || []).map((p, idx) => (
                  <p
                    key={idx}
                    className="text-xs sm:text-sm text-[#2d3131] dark:text-neutral-200 leading-[2.1] font-normal"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Fixed Bottom Agreement Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#f8faf9]/95 dark:bg-[#181c1c]/95 backdrop-blur-md border-t border-[#e2e8f0] dark:border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="w-full max-w-[480px] mx-auto p-4 space-y-3">
          {/* Agreement Checkbox */}
          <label
            htmlFor="terms-agreement-checkbox"
            className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#2d3131] rounded-2xl border border-[#f1e2e1] dark:border-neutral-700 card-shadow cursor-pointer hover:border-[#98001b] transition-all select-none"
            dir={currentLang === 'en' ? 'ltr' : 'rtl'}
          >
            <input
              id="terms-agreement-checkbox"
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-2 border-[#8f6f6e] text-[#98001b] focus:ring-[#98001b] cursor-pointer accent-[#98001b] shrink-0"
            />
            <span className={`text-xs sm:text-sm text-[#181c1c] dark:text-white leading-[1.8] font-medium flex-1 ${currentLang === 'en' ? 'text-left' : 'text-right'}`}>
              {currentLang === 'en'
                ? 'I confirm that I have read and agree to all scheme terms and policies.'
                : currentLang === 'sd'
                ? 'مان تصديق ڪريان ٿو/ٿي ته مان سڀ شرطون پڙهي ڇڏيون آهن ۽ مان متفق آهيان.'
                : 'میں تصدیق کرتا/کرتی ہوں کہ میں نے مذکورہ شرائط و ضوابط کو پڑھ لیا ہے اور میں ان سے اتفاق کرتا/کرتی ہوں۔'}
            </span>
          </label>

          {/* Primary Action Button */}
          <button
            id="terms-agree-btn"
            type="button"
            disabled={!isChecked || isProcessing}
            onClick={handleAgreeAndContinue}
            className={`w-full h-12 rounded-full font-bold transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-98 touch-target ${
              isChecked && !isProcessing
                ? 'bg-[#98001b] hover:bg-[#be1e2d] text-white shadow-maroon'
                : 'bg-[#e2e8f0] dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-75'
            }`}
          >
            {isProcessing ? (
              <span className="text-xs font-bold text-white">
                {currentLang === 'en' ? 'Processing...' : currentLang === 'sd' ? 'پروسيس ٿي رهيو آهي...' : 'پروسیس ہو رہا ہے...'}
              </span>
            ) : (
              <span className="text-sm font-bold tracking-wide">
                {currentLang === 'en' ? 'I Agree & Continue' : currentLang === 'sd' ? 'مان متفق آهيان ۽ اڳتي وڌو' : 'میں متفق ہوں اور آگے بڑھیں'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';
import { LanguageType } from '../lib/translations';
import { triggerHaptic } from '../lib/haptics';

interface InstallAppBannerProps {
  currentLang?: LanguageType;
}

export const InstallAppBanner: React.FC<InstallAppBannerProps> = ({ currentLang = 'ur' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed PWA mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(isRunningStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if dismissed before
    const dismissed = localStorage.getItem('as_install_dismissed');

    if (!isRunningStandalone && !dismissed) {
      // Show subtle banner after a brief delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Capture standard beforeinstallprompt on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    setShowBanner(false);
    localStorage.setItem('as_install_dismissed', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Mobile Install Pill Banner */}
      <div className="fixed top-14 left-3 right-3 z-40 max-w-[460px] mx-auto animate-in slide-in-from-top-4 duration-300">
        <div className="bg-gradient-to-r from-[#181c1c] via-[#242b2b] to-[#181c1c] text-white p-3 rounded-2xl shadow-xl border border-[#fed488]/40 flex items-center justify-between gap-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#98001b] to-[#700014] flex items-center justify-center border border-[#fed488]/60 shadow-md shrink-0">
              <Smartphone className="w-5 h-5 text-[#fed488]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white tracking-tight truncate">
                  {currentLang === 'en'
                    ? 'Install Apni Sawari App'
                    : currentLang === 'sd'
                    ? 'پنهنجي سواري ايپ انسٽال ڪريو'
                    : 'اپنی سواری موبائل ایپ انسٹال کریں'}
                </p>
                <span className="text-[9px] bg-[#fed488] text-[#4a3400] font-black px-1.5 py-0.2 rounded-full uppercase shrink-0">
                  PWA
                </span>
              </div>
              <p className="text-[10px] text-neutral-300 truncate">
                {currentLang === 'en'
                  ? 'Fast, offline access & instant draw alerts'
                  : currentLang === 'sd'
                  ? 'تيز رفتار ۽ بغير انٽرنيٽ نوٽيفڪيشن'
                  : 'تیز رفتار اور بغیر رکاوٹ استعمال کریں'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-[#fed488] hover:bg-[#ffdea5] active:scale-95 text-[#4a3400] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {currentLang === 'en'
                  ? 'Install'
                  : currentLang === 'sd'
                  ? 'انسٽال'
                  : 'انسٹال'}
              </span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Modal with iOS / Android Step-by-Step Instructions */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181c1c] w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#98001b] flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-[#fed488]" />
                </div>
                <h3 className="font-bold text-sm">
                  {currentLang === 'en'
                    ? 'How to Install on Mobile'
                    : currentLang === 'sd'
                    ? 'موبائل تي انسٽال ڪرڻ جو طريقو'
                    : 'موبائل پر ایپ انسٹال کرنے کا طریقہ'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-600 dark:text-neutral-300">
                  {currentLang === 'en'
                    ? 'Follow these 2 simple steps in Safari to add to your Home Screen:'
                    : currentLang === 'sd'
                    ? 'سفاري برائوزر ۾ اهي 2 مرحلا مڪمل ڪريو:'
                    : 'سفاری براؤزر میں یہ 2 آسان اقدامات مکمل کریں:'}
                </p>
                <div className="bg-neutral-50 dark:bg-neutral-900/70 p-3 rounded-2xl space-y-2.5 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#98001b] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{currentLang === 'en' ? 'Tap the' : 'نیچے دیا گیا'}</span>
                      <span className="inline-flex items-center gap-1 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded font-bold text-[11px]">
                        <Share className="w-3.5 h-3.5 text-blue-500" /> Share
                      </span>
                      <span>{currentLang === 'en' ? 'button below.' : 'بٹن دبائیں۔'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#98001b] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{currentLang === 'en' ? 'Select' : 'پھر'}</span>
                      <span className="inline-flex items-center gap-1 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded font-bold text-[11px]">
                        <PlusSquare className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" /> Add to Home Screen
                      </span>
                      <span>{currentLang === 'en' ? 'from options.' : 'منتخب کریں۔'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-600 dark:text-neutral-300">
                  {currentLang === 'en'
                    ? 'In Chrome / Browser Menu (⋮), tap "Install App" or "Add to Home Screen".'
                    : currentLang === 'sd'
                    ? 'برائوزر مينيو (⋮) مان "Add to Home Screen" يا "Install App" چونڊيو.'
                    : 'براؤزر مینو (⋮) سے "Install App" یا "Add to Home Screen" پر کلک کریں۔'}
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span className="text-[11px]">
                    {currentLang === 'en'
                      ? '100% Safe, Fast & Takes less than 2MB storage.'
                      : currentLang === 'sd'
                      ? '100% محفوظ ۽ صرف 2MB ميموري استعمال ڪري ٿو.'
                      : '100% محفوظ، تیز رفتار اور 2MB سے کم جگہ لیتی ہے۔'}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                triggerHaptic('light');
                setShowModal(false);
              }}
              className="w-full py-2.5 bg-[#98001b] hover:bg-[#700014] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              {currentLang === 'en' ? 'Got It' : currentLang === 'sd' ? 'سمجهه ۾ آيو' : 'ٹھیک ہے'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

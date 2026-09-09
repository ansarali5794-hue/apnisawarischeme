import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { LanguageType } from '../lib/translations';

interface NetworkStatusIndicatorProps {
  currentLang?: LanguageType;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({ currentLang = 'ur' }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-1 px-3 text-center text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md ${
        isOnline
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-600 text-white animate-pulse'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>
            {currentLang === 'en'
              ? 'Internet Connected'
              : currentLang === 'sd'
              ? 'انٽرنيٽ بحال ٿي ويو'
              : 'انٹرنیٹ بحال ہو گیا'}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {currentLang === 'en'
              ? 'You are offline (Viewing offline cache)'
              : currentLang === 'sd'
              ? 'توهان آف لائن آهيو (محفوظ ٿيل ڊيٽا کليل آهي)'
              : 'آپ آف لائن ہیں (محفوظ شدہ ڈیٹا دیکھا جا رہا ہے)'}
          </span>
        </>
      )}
    </div>
  );
};

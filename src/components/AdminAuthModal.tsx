import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, X, CheckCircle2, Eye, EyeOff, ShieldAlert, Clock } from 'lucide-react';
import { verifyAdminPinWithServer, sanitizeText } from '../lib/security';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../lib/rateLimiter';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminToken: string) => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check rate limit on open
  useEffect(() => {
    if (isOpen) {
      const rateCheck = checkRateLimit('admin_pin_modal', 5, 5 * 60 * 1000, 120 * 1000);
      if (!rateCheck.isAllowed) {
        setLockoutSeconds(rateCheck.retryAfterSeconds);
      } else {
        setLockoutSeconds(0);
      }
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    let timer: any;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit
    const rateCheck = checkRateLimit('admin_pin_modal', 5, 5 * 60 * 1000, 120 * 1000);
    if (!rateCheck.isAllowed) {
      setLockoutSeconds(rateCheck.retryAfterSeconds);
      setError(`  :       ${rateCheck.retryAfterSeconds}     `);
      return;
    }

    setIsLoading(true);

    try {
      const entered = sanitizeText(pinInput);
      const res = await verifyAdminPinWithServer(entered);

      setIsLoading(false);
      if (res.success && res.adminToken) {
        resetRateLimit('admin_pin_modal');
        setPinInput('');
        onSuccess(res.adminToken);
      } else {
        const result = recordFailedAttempt('admin_pin_modal', 5, 5 * 60 * 1000, 120 * 1000);
        if (!result.isAllowed || (res.retryAfterSeconds && res.retryAfterSeconds > 0)) {
          const waitTime = res.retryAfterSeconds || result.retryAfterSeconds;
          setLockoutSeconds(waitTime);
          setError(`  : 5                (${waitTime}s)`);
        } else {
          setError(res.message || `   / PIN!  : ${result.remainingAttempts}`);
        }
      }
    } catch {
      setIsLoading(false);
      setError('        ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#202424] w-full max-w-sm rounded-3xl p-6 border border-[#e0e3e2] dark:border-neutral-700 shadow-2xl space-y-4 text-center relative overflow-hidden">
        {/* Top Decorative Header */}
        <div className="w-14 h-14 rounded-2xl bg-[#98001b]/10 dark:bg-[#98001b]/30 text-[#98001b] dark:text-[#ffb3b0] flex items-center justify-center mx-auto mb-2 border border-[#98001b]/20">
          <Lock className="w-7 h-7" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="font-['Montserrat'] font-black text-lg text-[#181c1c] dark:text-white uppercase tracking-wider">
            Owner Secret Access
          </h3>
          <p className="font-urdu text-xs text-[#5b403f] dark:text-neutral-300 font-semibold mt-1">
                  /     
          </p>
          <p className="text-[11px] text-[#775a19] dark:text-[#fed488] mt-0.5">
            Enter master PIN code to unlock full control panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Master PIN"
              value={pinInput}
              disabled={lockoutSeconds > 0}
              onChange={(e) => {
                setPinInput(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-full pl-9 pr-10 py-3 bg-[#f7faf9] dark:bg-neutral-800 border-2 border-[#e0e3e2] dark:border-neutral-700 rounded-2xl text-center font-mono font-black text-lg tracking-widest text-[#181c1c] dark:text-white focus:border-[#98001b] outline-none transition-all disabled:opacity-50"
              required
            />
            <button
              type="button"
              disabled={lockoutSeconds > 0}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {lockoutSeconds > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs p-2.5 rounded-xl flex items-center justify-center gap-2 font-mono font-bold">
              <Clock className="w-4 h-4 animate-spin text-amber-600" />
              <span>Anti-Brute Force Lockout: {lockoutSeconds}s</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs p-2.5 rounded-xl flex items-center gap-2 text-left font-urdu">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 text-xs font-bold text-[#5b403f] dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="flex-1 py-3 rounded-2xl bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Checking...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-gray-400 dark:text-neutral-500 pt-1">
          Master PIN protected with anti-brute-force rate limiting
        </p>
      </div>
    </div>
  );
};

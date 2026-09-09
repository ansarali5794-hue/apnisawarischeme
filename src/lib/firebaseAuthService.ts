import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Normalizes phone numbers to standard E.164 format.
 * E.g., for Pakistan: '03001234567' -> '+923001234567'
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = String(phone).trim().replace(/[^0-9+]/g, '');
  if (!cleaned) return '';

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Pakistan local format: 03XX... -> +923XX...
  if (cleaned.startsWith('03')) {
    return '+92' + cleaned.substring(1);
  }

  // Pakistan local format without leading 0: 3XX... (10 digits)
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    return '+92' + cleaned;
  }

  // Default international prefix
  return '+' + cleaned;
}

/**
 * Initializes and manages Firebase reCAPTCHA Verifier for Phone OTP
 */
export function initRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  // 1. Clear any existing reCAPTCHA instance to prevent duplicate widget errors
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.warn('[Firebase Auth] Error clearing existing recaptcha verifier:', e);
    }
    recaptchaVerifier = null;
  }

  // Also clear any global recaptcha verifier if attached
  if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    (window as any).recaptchaVerifier = null;
  }

  // 2. Remove any existing container element from DOM completely to prevent "already rendered in this element"
  const existingContainer = document.getElementById(containerId);
  if (existingContainer && existingContainer.parentNode) {
    existingContainer.parentNode.removeChild(existingContainer);
  }

  // 3. Create a fresh new container element
  const container = document.createElement('div');
  container.id = containerId;
  container.style.display = 'none';
  document.body.appendChild(container);

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
      console.log('[Firebase Auth] reCAPTCHA verified successfully.');
    },
    'expired-callback': () => {
      console.warn('[Firebase Auth] reCAPTCHA expired. Needs refresh.');
    }
  });

  return recaptchaVerifier;
}

/**
 * Sends a real-time Phone OTP via Firebase Authentication (SMS Gateway)
 */
export async function sendPhoneOtp(
  phone: string,
  containerId: string = 'recaptcha-container'
): Promise<{ success: boolean; formattedPhone: string; error?: string }> {
  const formatted = formatPhoneNumber(phone);
  if (!formatted || formatted.length < 10) {
    return {
      success: false,
      formattedPhone: formatted,
      error: 'براہ کرم درست موبائل نمبر درج کریں (Invalid mobile number format).'
    };
  }

  const attemptSend = async (isRetry = false): Promise<{ success: boolean; formattedPhone: string; error?: string }> => {
    try {
      const appVerifier = initRecaptchaVerifier(containerId);
      confirmationResult = await signInWithPhoneNumber(auth, formatted, appVerifier);

      return {
        success: true,
        formattedPhone: formatted
      };
    } catch (err: unknown) {
      console.error('[Firebase Phone Auth] Error sending OTP:', err);

      const errMessage = err instanceof Error ? err.message : String(err);
      
      // Auto-retry once if reCAPTCHA was already rendered
      if (!isRetry && (errMessage.includes('already been rendered') || errMessage.includes('reCAPTCHA'))) {
        console.warn('[Firebase Auth] Retrying OTP send after resetting reCAPTCHA...');
        if (recaptchaVerifier) {
          try {
            recaptchaVerifier.clear();
          } catch {}
          recaptchaVerifier = null;
        }
        return attemptSend(true);
      }

      let friendlyMessage = 'Firebase Authentication کے ذریعے SMS روانہ نہیں ہو سکا۔';

      if (err && typeof err === 'object' && 'code' in err) {
        const code = String((err as { code: string }).code);
        if (code === 'auth/operation-not-allowed') {
          friendlyMessage =
            'Firebase Console میں SMS Region Policy انیبل درکار ہے (یا فائر بیس کنسول میں Phone Auth کے لیے علاقہ منتخب کریں)۔ عارضی ٹیسٹنگ کے لیے Firebase Console میں ٹیسٹ فون نمبر بھی شامل کیا جا سکتا ہے۔';
        } else if (code === 'auth/invalid-phone-number') {
          friendlyMessage = 'موبائل نمبر کا فارمیٹ درست نہیں ہے (Invalid phone number).';
        } else if (code === 'auth/too-many-requests') {
          friendlyMessage = 'بہت زیادہ کوششیں کی گئی ہیں۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔ (Too many attempts. Please try again later).';
        } else if (code === 'auth/quota-exceeded') {
          friendlyMessage = 'آج کی ایس ایم ایس کوٹہ حد مکمل ہو چکی ہے (SMS Quota exceeded).';
        } else if (code === 'auth/captcha-check-failed' || errMessage.includes('reCAPTCHA')) {
          friendlyMessage = 'سیکیورٹی تصدیق (reCAPTCHA) ری سیٹ ہو گئی ہے۔ براہ کرم "Resend Code" پر کلک کر کے دوبارہ کوشش کریں۔';
        } else if (code === 'auth/invalid-app-credential') {
          friendlyMessage = 'ایپلیکیشن سیکیورٹی کنفیگریشن کی تصدیق درکار ہے۔';
        }
      } else if (err instanceof Error) {
        if (err.message.includes('already been rendered')) {
          friendlyMessage = 'سیکیورٹی تصدیق (reCAPTCHA) ری سیٹ ہو گئی ہے۔ براہ کرم "Resend Code" پر کلک کریں۔';
        } else {
          friendlyMessage = err.message;
        }
      }

      return {
        success: false,
        formattedPhone: formatted,
        error: friendlyMessage
      };
    }
  };

  return attemptSend(false);
}

/**
 * Verifies the 6-digit OTP code entered by the user via Firebase Authentication
 */
export async function verifyPhoneOtp(
  otpCode: string
): Promise<{ success: boolean; userCredential?: UserCredential; error?: string }> {
  try {
    if (!confirmationResult) {
      return {
        success: false,
        error: 'کوئی فعال تصدیقی سیشن موجود نہیں ہے۔ براہ کرم کوڈ دوبارہ بھیجیں۔ (No active OTP session. Please click resend code).'
      };
    }

    const cleanCode = otpCode.trim().replace(/[^0-9]/g, '');
    if (cleanCode.length !== 6) {
      return {
        success: false,
        error: 'براہ کرم 6 ہندسوں کا درست OTP کوڈ درج کریں۔ (Please enter a valid 6-digit OTP code).'
      };
    }

    const credential = await confirmationResult.confirm(cleanCode);
    return {
      success: true,
      userCredential: credential
    };
  } catch (err: unknown) {
    console.error('[Firebase Phone Auth] Error verifying OTP:', err);
    let friendlyMessage = 'درج کردہ OTP کوڈ غلط ہے یا اس کی میعاد ختم ہو چکی ہے۔';

    if (err && typeof err === 'object' && 'code' in err) {
      const code = String((err as { code: string }).code);
      if (code === 'auth/invalid-verification-code') {
        friendlyMessage = 'درج کردہ OTP کوڈ غلط ہے (Invalid verification code)۔ براہ کرم صحیح 6 ہندسوں کا کوڈ درج کریں یا دوبارہ نیا کوڈ منگوائیں۔';
      } else if (code === 'auth/code-expired') {
        friendlyMessage = 'اس تصدیقی کوڈ کی میعاد ختم ہو چکی ہے (Code expired)۔ براہ کرم "Resend Code" پر کلک کر کے نیا کوڈ حاصل کریں۔';
      }
    }

    return {
      success: false,
      error: friendlyMessage
    };
  }
}

/**
 * Sends a real-time Password Reset Email via Firebase Authentication
 */
export async function sendFirebasePasswordReset(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return {
        success: false,
        error: 'براہ کرم درست ای میل پتہ درج کریں۔ (Please provide a valid email address).'
      };
    }

    await sendPasswordResetEmail(auth, sanitizedEmail);
    return {
      success: true
    };
  } catch (err: unknown) {
    console.error('[Firebase Auth] Error sending password reset email:', err);
    let friendlyMessage = 'پاس ورڈ ری سیٹ ای میل روانہ نہیں ہو سکی۔';

    if (err && typeof err === 'object' && 'code' in err) {
      const code = String((err as { code: string }).code);
      if (code === 'auth/user-not-found') {
        friendlyMessage = 'اس ای میل سے منسلک کوئی اکاؤنٹ موجود نہیں ہے۔';
      } else if (code === 'auth/invalid-email') {
        friendlyMessage = 'ای میل ایڈریس کا فارمیٹ درست نہیں ہے۔';
      } else if (code === 'auth/too-many-requests') {
        friendlyMessage = 'بہت زیادہ درخواستیں بھیجی گئی ہیں۔ براہ کرم کچھ دیر انتظار کریں۔';
      }
    }

    return {
      success: false,
      error: friendlyMessage
    };
  }
}

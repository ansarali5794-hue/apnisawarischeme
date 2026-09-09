import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  User,
  Phone,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  KeyRound,
  UserCheck,
  MapPin,
  X,
  WifiOff,
  Check,
  Globe,
  Clock,
  RefreshCw, Upload, FileCheck, Building2, Smartphone
} from 'lucide-react';
import { UserProfile, RegistrationFormData, VehicleProject, BankAccountDetail } from "../types";
import {
  LanguageType,
  LANGUAGES,
  TRANSLATIONS,
  getSavedLanguage,
  saveLanguage
} from '../lib/translations';
import { LanguageDropdown } from '../components/LanguageDropdown';
import { sanitizeText, verifyAdminPinWithServer, validatePasswordStrength } from '../lib/security';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '../lib/rateLimiter';
import { saveUserToFirestore } from '../lib/firestoreService';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onAdminLoginSuccess: (adminToken: string) => void;
  onProceedToTerms: (formData: RegistrationFormData) => void;
  savedFormData?: RegistrationFormData | null;
  registeredUsers: UserProfile[];
  currentLang?: LanguageType;
  onLangChange?: (lang: LanguageType) => void;
  vehicleProjects?: VehicleProject[];
  bankAccounts?: BankAccountDetail[];
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onAdminLoginSuccess,
  onProceedToTerms,
  savedFormData,
  registeredUsers,
  currentLang: externalLang,
  onLangChange: externalOnLangChange,
}) => {
  // Language State
  const [lang, setLang] = useState<LanguageType>(() => {
    return externalLang || getSavedLanguage();
  });

  useEffect(() => {
    if (externalLang && externalLang !== lang) {
      setLang(externalLang);
    }
  }, [externalLang]);

  const handleLanguageChange = (newLang: LanguageType) => {
    setLang(newLang);
    saveLanguage(newLang);
    if (externalOnLangChange) {
      externalOnLangChange(newLang);
    }
  };

  const t = TRANSLATIONS[lang];
  const langConfig = LANGUAGES[lang];

  // Main login mode selection: 'member' or 'admin'
  const [authRole, setAuthRole] = useState<'member' | 'admin'>('member');
  const [memberTab, setMemberTab] = useState<'login' | 'register'>(
    savedFormData ? 'register' : 'login'
  );

  // Online / Offline state detection
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Member Login state
  const [identifier, setIdentifier] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [memberLoginError, setMemberLoginError] = useState('');
  const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);

  // Admin Login state
  const [enteredAdminPin, setEnteredAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Registration form state (Dummy photo upload removed as per Picture 1)
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: savedFormData?.fullName || '',
    cnic: savedFormData?.cnic || '',
    phone: savedFormData?.phone || '',
    email: savedFormData?.email || '',
    address: savedFormData?.address || '',
    password: savedFormData?.password || '',
    confirmPassword: savedFormData?.confirmPassword || '',
    avatarUrl: savedFormData?.avatarUrl || ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [isPendingApprovalDuplicate, setIsPendingApprovalDuplicate] = useState(false);

  const [selectedProject, setSelectedProject] = useState<VehicleProject | null>(null);
  const [monthsPassed, setMonthsPassed] = useState(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'newPassword' | 'success'>('input');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotUser, setForgotUser] = useState<UserProfile | null>(null);
  const [forgotEnteredOtp, setForgotEnteredOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotTimer, setForgotTimer] = useState(60);
  const [forgotError, setForgotError] = useState('');

  // OTP Countdown Timers
  useEffect(() => {
    let interval: any;
    if (showForgotModal && forgotStep === 'otp' && forgotTimer > 0) {
      interval = setInterval(() => {
        setForgotTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, forgotTimer]);

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (regError) setRegError('');
  };

  // Member Login Handler (Strict online check + Account frozen check + Strict password matching + Rate limiting)
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberLoginError('');

    if (!navigator.onLine) {
      setMemberLoginError(t.offlineError);
      return;
    }

    const cleanId = sanitizeText(identifier).toLowerCase();
    const cleanPass = sanitizeText(memberPassword);

    if (!cleanId) {
      setMemberLoginError(t.enterIdentifier);
      return;
    }
    if (!cleanPass) {
      setMemberLoginError(t.password);
      return;
    }

    // Rate Limiting Check: 5 attempts / 5 mins
    const rateKey = `member_login_${cleanId}`;
    const rateCheck = checkRateLimit(rateKey, 5, 5 * 60 * 1000, 60 * 1000);
    if (!rateCheck.isAllowed) {
      setMemberLoginError(`سیکورٹی لاک آؤٹ: بہت زیادہ غلط کوششیں۔ براہ کرم ${rateCheck.retryAfterSeconds} سیکنڈ بعد دوبارہ کوشش کریں۔`);
      return;
    }

    setIsMemberSubmitting(true);

    setTimeout(() => {
      setIsMemberSubmitting(false);

      // Find user from cloud-synced registeredUsers
      const foundUser = registeredUsers.find((u) => {
        const phone = (u.phone || u.phoneNumber || u.phone_number || '').trim().toLowerCase();
        const memberId = (u.memberId || '').trim().toLowerCase();
        const cnic = (u.cnic || '').trim().toLowerCase();
        const email = (u.email || '').trim().toLowerCase();
        return phone === cleanId || memberId === cleanId || cnic === cleanId || email === cleanId;
      });

      if (!foundUser) {
        const result = recordFailedAttempt(rateKey, 5, 5 * 60 * 1000, 60 * 1000);
        if (!result.isAllowed) {
          setMemberLoginError(`سیکورٹی لاک آؤٹ: 5 غلط کوششوں کے بعد لاگ ان عارضی طور پر بند کر دیا گیا ہے۔ (${result.retryAfterSeconds}s)`);
        } else {
          setMemberLoginError(`${t.accountNotFoundError} (باقی کوششیں: ${result.remainingAttempts})`);
        }
        return;
      }

      // Check account statuses
      if (foundUser.account_status === 'rejected') {
        setMemberLoginError('آپ کی درخواست مسترد کر دی گئی ہے۔\n(Your application has been rejected.)');
        return;
      }

      // Check account freeze / suspended status
      if (foundUser.account_status === 'frozen' || foundUser.account_status === 'suspended') {
        setMemberLoginError(t.accountFrozenError);
        return;
      }

      // Verify password strictly
      if (foundUser.password && foundUser.password !== cleanPass) {
        const result = recordFailedAttempt(rateKey, 5, 5 * 60 * 1000, 60 * 1000);
        if (!result.isAllowed) {
          setMemberLoginError(`سیکورٹی لاک آؤٹ: 5 غلط کوششوں کے بعد لاگ ان عارضی طور پر بند کر دیا گیا ہے۔ (${result.retryAfterSeconds}s)`);
        } else {
          setMemberLoginError(`${t.incorrectPassError} (باقی کوششیں: ${result.remainingAttempts})`);
        }
        return;
      }

      // Successful login -> Reset rate limit
      resetRateLimit(rateKey);
      onLoginSuccess(foundUser);
    }, 400);
  };

  // Admin Login Handler with Rate Limiting & Master PIN Resolution
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    if (!navigator.onLine) {
      setAdminLoginError(t.offlineError);
      return;
    }

    const cleanPin = sanitizeText(enteredAdminPin);
    if (!cleanPin) {
      setAdminLoginError('براہ کرم ایڈمن پن درج کریں');
      return;
    }

    const rateKey = 'admin_login_authview';
    const rateCheck = checkRateLimit(rateKey, 5, 5 * 60 * 1000, 120 * 1000);
    if (!rateCheck.isAllowed) {
      setAdminLoginError(`سیکورٹی لاک آؤٹ: ایڈمن پورٹل عارضی طور پر بند ہے۔ (${rateCheck.retryAfterSeconds}s)`);
      return;
    }

    setIsAdminSubmitting(true);

    try {
      const res = await verifyAdminPinWithServer(cleanPin);
      setIsAdminSubmitting(false);

      if (res.success && res.adminToken) {
        resetRateLimit(rateKey);
        onAdminLoginSuccess(res.adminToken);
      } else {
        const result = recordFailedAttempt(rateKey, 5, 5 * 60 * 1000, 120 * 1000);
        const waitTime = res.retryAfterSeconds || result.retryAfterSeconds;
        if (!result.isAllowed || waitTime > 0) {
          setAdminLoginError(`سیکورٹی لاک آؤٹ: 5 غلط کوششوں کے بعد ایڈمن لاگ ان عارضی طور پر بند کر دیا گیا ہے۔ (${waitTime}s)`);
        } else {
          setAdminLoginError(res.message || `غلط پن کوڈ (Incorrect Admin PIN) - باقی کوششیں: ${result.remainingAttempts}`);
        }
      }
    } catch {
      setIsAdminSubmitting(false);
      setAdminLoginError('ایڈمن تصدیق میں خرابی۔ انٹرنیٹ کنکشن چیک کریں۔');
    }
  };

  // Registration Submit Handler (With duplicate CNIC and Phone validation + OTP dispatch + Input Sanitization)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!navigator.onLine) {
      setRegError(t.offlineError);
      return;
    }

    const sanitizedFullName = sanitizeText(formData.fullName);
    const sanitizedAddress = sanitizeText(formData.address);

    if (!sanitizedFullName) {
      setRegError('برائے مہربانی اپنا پورا نام لکھیں (Enter full name).');
      return;
    }

    const cleanCnic = formData.cnic.replace(/[^0-9]/g, '');
    if (!cleanCnic || cleanCnic.length < 13) {
      setRegError('برائے مہربانی 13 ہندسوں کا درست شناختی کارڈ نمبر درج کریں (Enter 13-digit CNIC).');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setRegError('برائے مہربانی درست موبائل نمبر درج کریں (Enter valid phone number).');
      return;
    }

    if (!sanitizedAddress) {
      setRegError('برائے مہربانی اپنا مکمل رہائشی پتہ درج کریں (Enter address).');
      return;
    }

    const passCheck = validatePasswordStrength(formData.password);
    if (!passCheck.isValid) {
      setRegError(passCheck.message || 'پاس ورڈ کم از کم 6 ہندسوں یا حروف کا ہونا چاہیے (Password must be at least 6 characters).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setRegError('پاس ورڈ اور تصدیقی پاس ورڈ آپس میں مماثلت نہیں رکھتے (Passwords do not match).');
      return;
    }


    // STRICT CHECK & BALANCE: Prevent duplicate registration by CNIC
    const duplicateUserByCnic = registeredUsers.find((u) => {
      const existingCnic = (u.cnic || '').replace(/[^0-9]/g, '');
      return existingCnic && existingCnic === cleanCnic;
    });

    // STRICT CHECK & BALANCE: Prevent duplicate registration by Phone Number
    const duplicateUserByPhone = registeredUsers.find((u) => {
      const existingPhone = (u.phone || u.phoneNumber || u.phone_number || '').replace(/[^0-9]/g, '');
      return existingPhone && (existingPhone === cleanPhone || existingPhone.endsWith(cleanPhone) || cleanPhone.endsWith(existingPhone));
    });

    const duplicateUser = duplicateUserByCnic || duplicateUserByPhone;

    if (duplicateUser) {
      if (duplicateUser.account_status === 'pending') {
        setIsPendingApprovalDuplicate(true);
        return;
      } else {
        setRegError(duplicateUserByCnic ? t.duplicateCnicError : t.duplicatePhoneError);
        return;
      }
    }

    // Update sanitized form data
    const finalFormData = {
      ...formData,
      fullName: sanitizedFullName,
      email: '',
      address: sanitizedAddress
    };
    
    setFormData(finalFormData);
    onProceedToTerms(finalFormData);
  };

  // ==========================================
  // FORGOT PASSWORD FLOW HANDLERS
  // ==========================================
  const handleOpenForgotModal = () => {
    setForgotStep('input');
    setForgotIdentifier('');
    setForgotUser(null);
    setForgotEnteredOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setShowForgotModal(true);
  };

  const handleForgotSubmitIdentifier = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!navigator.onLine) {
      setForgotError(t.offlineError);
      return;
    }

    const cleanInput = forgotIdentifier.trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');

    const found = registeredUsers.find((u) => {
      const phone = (u.phone || u.phoneNumber || u.phone_number || '').replace(/[^0-9]/g, '');
      const memberId = (u.memberId || '').toLowerCase();
      const cnic = (u.cnic || '').replace(/[^0-9]/g, '');
      const email = (u.email || '').toLowerCase();

      return (
        memberId === cleanInput ||
        email === cleanInput ||
        (cleanDigits && phone && (phone === cleanDigits || phone.endsWith(cleanDigits))) ||
        (cleanDigits && cnic && cnic === cleanDigits)
      );
    });

    if (!found) {
      setForgotError(t.accountNotFoundError);
      return;
    }

    setForgotUser(found);
    setForgotStep('newPassword');
  };

  const handleForgotSubmitNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPassword.length < 6) {
      setForgotError(lang === 'sd' ? 'پاسورڊ گهٽ ۾ گهٽ 6 اکرن جو هجڻ گهرجي' : lang === 'ur' ? 'پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے' : 'Password must be at least 6 characters');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(lang === 'sd' ? 'پاسورڊ نٿا ملن' : lang === 'ur' ? 'پاس ورڈ نہیں ملتے' : 'Passwords do not match');
      return;
    }

    if (!forgotUser) return;

    const updatedUser = {
      ...forgotUser,
      resetPasswordRequested: true,
      resetPasswordRequestedAt: new Date().toISOString(),
      pendingNewPassword: forgotNewPassword
    };

    saveUserToFirestore(updatedUser).catch(err => {
      console.warn('Error saving password reset request to firestore:', err);
    });

    setForgotStep('success');
  };

  return (
    <div className="w-full sm:max-w-[480px] min-h-screen sm:min-h-0 mx-auto relative flex flex-col justify-start">
      <div className="w-full bg-white dark:bg-[#1e2323] sm:rounded-3xl rounded-none sm:shadow-2xl shadow-none sm:border border-0 border-[#e0e3e2] dark:border-neutral-700 overflow-hidden relative flex-1 flex flex-col pb-[max(env(safe-area-inset-bottom),1rem)]">
        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-red-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>{t.offlineError}</span>
          </div>
        )}

        {/* Brand Banner Header with Top Screen Language Selector */}
        <div className="bg-gradient-to-br from-[#98001b] via-[#800016] to-[#59000f] text-white p-5 sm:p-6 pt-[max(env(safe-area-inset-top),1.25rem)] text-center relative sm:rounded-t-3xl rounded-none z-20">
          {/* Background decorative blurs constrained to inner overflow container */}
          <div className="absolute inset-0 overflow-hidden sm:rounded-t-3xl rounded-none pointer-events-none">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#fed488] rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -left-8 -top-8 w-28 h-28 bg-[#fed488] rounded-full opacity-15 blur-xl"></div>
          </div>

          {/* Top Screen Language Selector Dropdown */}
          <div className="flex items-center justify-center pb-3 mb-3 border-b border-white/15 relative z-30">
            <LanguageDropdown
              currentLang={lang}
              onLangChange={handleLanguageChange}
              variant="glass"
            />
          </div>

          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-2.5 text-[#261900] shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
            {t.appTitle}
          </h1>
          <p className="text-xs text-[#fed488] font-bold mt-1 tracking-wide">
            {t.appSubtitle}
          </p>
        </div>

        {/* 1. Main Role Selector Buttons: [ 👤 Member Login ] | [ 🛡️ Admin Login ] */}
        <div className="p-3.5 sm:p-4 bg-[#f1f4f3] dark:bg-neutral-800/80 border-b border-[#e0e3e2] dark:border-neutral-700">
          <p className="text-[11px] font-bold text-center text-[#5b403f] dark:text-neutral-400 uppercase tracking-wider mb-2">
            {t.selectLoginType}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-select-member-login"
              type="button"
              onClick={() => {
                setAuthRole('member');
                setMemberLoginError('');
              }}
              className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm ${
                authRole === 'member'
                  ? 'bg-[#98001b] text-white ring-2 ring-[#98001b] shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-neutral-700 text-[#181c1c] dark:text-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>{t.customerLogin}</span>
              </div>
              <span className={`text-[10px] ${authRole === 'member' ? 'text-[#fed488]' : 'text-neutral-500'}`}>
                {t.customerLoginSub}
              </span>
            </button>

            <button
              id="btn-select-admin-login"
              type="button"
              onClick={() => {
                setAuthRole('admin');
                setAdminLoginError('');
              }}
              className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm ${
                authRole === 'admin'
                  ? 'bg-[#181c1c] text-[#fed488] ring-2 ring-[#fed488] shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-neutral-700 text-[#181c1c] dark:text-neutral-200 hover:bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#fed488]" />
                <span>{t.adminLogin}</span>
              </div>
              <span className={`text-[10px] ${authRole === 'admin' ? 'text-white' : 'text-neutral-500'}`}>
                {t.adminLoginSub}
              </span>
            </button>
          </div>
        </div>

        {/* 2. ADMIN PORTAL LOGIN */}
        {authRole === 'admin' && (
          <div className="p-5 sm:p-6 space-y-4 animate-in fade-in">
            <div className="bg-[#181c1c] text-white p-4 rounded-2xl border border-[#fed488]/40 space-y-1 text-center">
              <div className="flex items-center justify-center gap-2 text-[#fed488]">
                <Lock className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  {t.adminLogin}
                </h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                ایڈمن پینل کھولنے کے لیے اپنا خفیہ پن کوڈ درج کریں۔
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {adminLoginError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#181c1c] dark:text-white uppercase mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#98001b]" />
                    {t.adminPin}
                  </span>
                  <span className="text-[11px] text-[#775a19] dark:text-[#fed488] font-semibold">PIN</span>
                </label>
                <div className="relative">
                  <input
                    id="input-admin-pin"
                    type={showAdminPin ? 'text' : 'password'}
                    value={enteredAdminPin}
                    onChange={(e) => setEnteredAdminPin(e.target.value)}
                    placeholder={t.adminPinPlaceholder}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-3 text-sm font-mono font-bold tracking-widest focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white pr-10"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    className="absolute right-3 top-3.5 text-[#8f6f6e] hover:text-[#181c1c] cursor-pointer"
                  >
                    {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-admin-login-submit"
                type="submit"
                disabled={isAdminSubmitting}
                className="w-full bg-[#181c1c] hover:bg-[#2d3131] text-[#fed488] font-black text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-[#fed488]/50"
              >
                {isAdminSubmitting ? (
                  <span>Verifying Admin PIN...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#fed488]" />
                    <span>{t.adminLoginBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 3. CUSTOMER / MEMBER LOGIN & REGISTRATION */}
        {authRole === 'member' && (
          <div>
            {/* Member Sub Tabs: Login vs Register */}
            <div className="flex border-b border-[#e0e3e2] dark:border-neutral-700 bg-[#ebeeed] dark:bg-neutral-800">
              <button
                id="tab-member-login"
                onClick={() => setMemberTab('login')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  memberTab === 'login'
                    ? 'bg-white dark:bg-[#1e2323] text-[#98001b] dark:text-[#ffb3b0] border-t-2 border-[#98001b]'
                    : 'text-[#5b403f] dark:text-neutral-400 hover:text-[#181c1c]'
                }`}
              >
                {t.memberLogin}
              </button>
              <button
                id="tab-member-register"
                onClick={() => setMemberTab('register')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  memberTab === 'register'
                    ? 'bg-white dark:bg-[#1e2323] text-[#98001b] dark:text-[#ffb3b0] border-t-2 border-[#98001b]'
                    : 'text-[#5b403f] dark:text-neutral-400 hover:text-[#181c1c]'
                }`}
              >
                {t.newRegistration}
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {memberTab === 'login' ? (
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  {memberLoginError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{memberLoginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#181c1c] dark:text-white uppercase mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#98001b]" />
                      {t.enterIdentifier}
                    </label>
                    <input
                      id="member-login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={t.enterIdentifierPlaceholder}
                      className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-[#181c1c] dark:text-white uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#98001b]" />
                        {t.password}
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenForgotModal}
                        className="text-xs font-bold text-[#98001b] dark:text-[#ffb3b0] hover:underline cursor-pointer"
                      >
                        {t.forgotPassword}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        id="member-login-password"
                        type={showMemberPassword ? 'text' : 'password'}
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowMemberPassword(!showMemberPassword)}
                        className="absolute right-3 top-2.5 text-[#8f6f6e] hover:text-[#181c1c]"
                      >
                        {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-member-login-submit"
                    type="submit"
                    disabled={isMemberSubmitting}
                    className="w-full bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-2"
                  >
                    {isMemberSubmitting ? (
                      <span>Verifying & Signing in...</span>
                    ) : (
                      <>
                        <span>{t.loginBtn}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : isPendingApprovalDuplicate ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-in fade-in">
                  <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 rounded-full flex items-center justify-center mb-5 shadow-sm border border-yellow-100 dark:border-yellow-900/30">
                    <Clock className="w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-black text-[#181c1c] dark:text-white mb-3 tracking-tight">
                    {lang === 'ur' ? 'منظوری زیر التوا' : lang === 'sd' ? 'منظوري التوا هيٺ' : 'Approval Pending'}
                  </h2>
                  <p className="text-sm text-[#8f6f6e] dark:text-[#a0a5a5] leading-relaxed mb-8 font-semibold">
                    {t.duplicateApprovalError}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPendingApprovalDuplicate(false)}
                    className="w-full bg-[#181c1c] text-[#fed488] hover:bg-black font-bold text-sm py-4 rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    {lang === 'ur' ? 'واپس جائیں' : lang === 'sd' ? 'واپس وڃو' : 'Go Back'}
                  </button>
                </div>
              ) : (
                /* REGISTRATION FORM - DUMMY PICTURE UPLOAD REMOVED AS REQUESTED IN PICTURE 1 */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {regError && (
                    <div className="bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#181c1c] dark:text-white uppercase mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#98001b]" />
                      {t.fullName}
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                      required
                    />
                  </div>

                  {/* 2. CNIC & 3. Phone Number */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#181c1c] dark:text-white uppercase mb-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-[#98001b]" />
                        {t.cnic}
                      </label>
                      <input
                        id="reg-cnic"
                        type="text"
                        placeholder={t.cnicPlaceholder}
                        value={formData.cnic}
                        onChange={(e) => handleInputChange('cnic', e.target.value)}
                        className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#181c1c] dark:text-white uppercase mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#98001b]" />
                        {t.phone}
                      </label>
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder={t.phonePlaceholder}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* 4. Residential Address */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#181c1c] dark:text-white uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#98001b]" />
                      {t.address}
                    </label>
                    <input
                      id="reg-address"
                      type="text"
                      placeholder={t.addressPlaceholder}
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                      required
                    />
                  </div>


                  {/* 6. Password & Confirm Password */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#181c1c] dark:text-white uppercase mb-1">
                        {t.password}
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder={t.passwordPlaceholder}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white pr-8"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-2 text-[#8f6f6e]"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#181c1c] dark:text-white uppercase mb-1">
                        {t.confirmPassword}
                      </label>
                      <div className="relative">
                        <input
                          id="reg-confirmpassword"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          placeholder={t.confirmPasswordPlaceholder}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white pr-8"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2.5 top-2 text-[#8f6f6e]"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-register-submit"
                    type="submit"
                    className="w-full bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 mt-3"
                  >
                    <span>{t.submitApprovalBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 2: FORGOT PASSWORD MODAL */}
      {/* ========================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-3.5">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#98001b]" />
                <h3 className="font-bold text-sm text-[#181c1c] dark:text-white">
                  {t.forgotPasswordTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Phone / Token Number */}
            {forgotStep === 'input' && (
              <form onSubmit={handleForgotSubmitIdentifier} className="space-y-3.5">
                <div className="text-right">
                  <p className="text-sm font-bold text-[#181c1c] dark:text-white">
                    {t.forgotPasswordTitle}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {t.forgotPasswordDesc}
                  </p>
                </div>

                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="03001234567 or TK-2024-101"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                  required
                  autoFocus
                />

                <button
                  type="submit"
                  className="w-full bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{t.sendOtp}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Enter New Password */}
            {forgotStep === 'newPassword' && (
              <form onSubmit={handleForgotSubmitNewPassword} className="space-y-3.5">
                <div className="text-right">
                  <p className="text-sm font-bold text-[#181c1c] dark:text-white">
                    {lang === 'sd' ? 'نئون پاسورڊ داخل ڪريو' : lang === 'ur' ? 'نیا پاس ورڈ درج کریں' : 'Enter New Password'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {lang === 'sd' ? 'پنهنجو نئون پاسورڊ لکو جيڪو توهان رکڻ چاهيو ٿا' : lang === 'ur' ? 'اپنا نیا پاس ورڈ لکھیں جو آپ رکھنا چاہتے ہیں' : 'Enter your desired new password'}
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder={lang === 'sd' ? 'نئون پاسورڊ' : lang === 'ur' ? 'نیا پاس ورڈ' : 'New Password'}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                    required
                    autoFocus
                  />
                  <input
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder={lang === 'sd' ? 'پاسورڊ جي تصديق ڪريو' : lang === 'ur' ? 'پاس ورڈ کی تصدیق کریں' : 'Confirm Password'}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <span>{lang === 'sd' ? 'درخواست موڪليو' : lang === 'ur' ? 'درخواست بھیجیں' : 'Submit Request'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 3: Success State */}
            {forgotStep === 'success' && (
              <div className="text-center py-4 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-emerald-800">
                  آپ کی پاس ورڈ تبدیل کرنے کی درخواست ایڈمن کو بھیج دی گئی ہے۔ ایڈمن جلد نیا پاس ورڈ سیٹ کر دے گا۔
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  (Password reset request sent to Admin successfully.)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

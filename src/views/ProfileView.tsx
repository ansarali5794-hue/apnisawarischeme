import React, { useState, useRef } from 'react';
import { User, Phone, CreditCard, Shield, FileText, Lock, ChevronRight, LogOut, Sparkles, MapPin, CheckCircle2, Edit3, Save, KeyRound, Eye, EyeOff, AlertCircle, Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { UserProfile, TabType, UserActiveProject } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';
import { compressImageToDataUrl } from '../lib/imageCompressor';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface ProfileViewProps {
  user: UserProfile;
  activeProjects: UserActiveProject[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: TabType) => void;
  onOpenBrochure: () => void;
  onLogout: () => void;
  currentLang?: LanguageType;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  activeProjects,
  onUpdateProfile,
  onNavigate,
  onOpenBrochure,
  onLogout,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || user.full_name || '');
  const [phone, setPhone] = useState(user.phoneNumber || user.phone || '');
  const [cnic, setCnic] = useState(user.cnic || '');
  const [address, setAddress] = useState(user.address || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Photo Update State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(user.avatarUrl || '');
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const galleryRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setPhotoError('');
      // Compress image client-side to lightweight ~30-50KB for instant cloud sync across PC/Mobile
      const compressedDataUrl = await compressImageToDataUrl(file, 480, 480, 0.82);
      setPhotoPreview(compressedDataUrl);

      let avatarUrl = compressedDataUrl;
      // Upload to Firebase Cloud Storage if possible
      if (user.uid) {
        try {
          const storageReference = ref(storage, `users/${user.uid}/profile_${Date.now()}.webp`);
          await uploadString(storageReference, compressedDataUrl, 'data_url');
          avatarUrl = await getDownloadURL(storageReference);
          setPhotoPreview(avatarUrl);
        } catch (storageErr) {
          console.error('Failed to upload to Cloud Storage, falling back to data URL:', storageErr);
        }
      }
      
      // Auto-save and sync immediately to Firestore so PC and Mobile show it instantly!
      onUpdateProfile({ avatarUrl });
      setPhotoSuccess(true);
      setTimeout(() => {
        setPhotoSuccess(false);
        setShowPhotoModal(false);
      }, 1500);
    } catch (err) {
      console.error('Photo compression error:', err);
      setPhotoError(
        currentLang === 'sd'
          ? 'تصوير چونڊڻ ۾ خرابي. ٻيهر ڪوشش ڪريو.'
          : currentLang === 'ur'
          ? 'تصویر منتخب کرنے میں خرابی۔ دوبارہ کوشش کریں۔'
          : 'Error processing image. Please try again.'
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSavePhoto = () => {
    if (!photoPreview) {
      setPhotoError(
        currentLang === 'sd'
          ? 'مهرباني ڪري تصوير چونڊيو.'
          : currentLang === 'ur'
          ? 'براہ کرم تصویر منتخب کریں۔'
          : 'Please select a photo.'
      );
      return;
    }
    // If it's already a firebase storage URL or we already auto-saved, this is just to close the modal
    if (!photoPreview.startsWith('data:')) {
      onUpdateProfile({ avatarUrl: photoPreview });
    }
    setPhotoSuccess(true);
    setTimeout(() => {
      setPhotoSuccess(false);
      setShowPhotoModal(false);
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, phoneNumber: phone, phone: phone, cnic, address });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (user.password && currentPassword.trim() && user.password !== currentPassword.trim()) {
      setPassError(t.incorrectPassError);
      return;
    }

    if (newPassword.length < 6) {
      setPassError('نیا پاس ورڈ کم از کم 6 ہندسوں یا حروف کا ہونا چاہیے (Min 6 characters).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('نیا پاس ورڈ اور تصدیقی پاس ورڈ آپس میں مماثلت نہیں رکھتے (Passwords do not match).');
      return;
    }

    onUpdateProfile({
      resetPasswordRequested: true,
      pendingNewPassword: newPassword,
      resetPasswordRequestedAt: new Date().toISOString()
    });
    setPassSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPassSuccess(false);
      setShowPasswordChange(false);
    }, 4500);
  };

  return (
    <div className="space-y-5 px-4 py-5 animate-in fade-in duration-300 pb-10">
      {/* Profile Header Bento Card */}
      <div className="bg-white dark:bg-[#2d3131] rounded-3xl p-5 border border-[#f1e2e1] dark:border-neutral-700 card-shadow flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-[#98001b]"></div>

        {/* Avatar with Pen / Edit Icon */}
        <div className="relative z-10 mb-3 mt-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#2d3131] shadow-lg bg-[#f8faf9] flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <User className="w-12 h-12 text-neutral-400" />
            )}
          </div>

          {/* Pen / Edit Icon button */}
          <button
            id="btn-edit-profile-photo"
            type="button"
            onClick={() => {
              setPhotoPreview(user.avatarUrl || '');
              setPhotoError('');
              setShowPhotoModal(true);
            }}
            title={t.changePhoto}
            className="absolute bottom-0 right-0 bg-[#98001b] hover:bg-[#be1e2d] text-white p-2 rounded-full shadow-maroon border-2 border-white dark:border-[#2d3131] cursor-pointer transition-transform hover:scale-110 active:scale-95 flex items-center justify-center touch-target"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-headline font-black text-xl text-[#181c1c] dark:text-white">
          {user.name}
        </h2>
                <div className="flex flex-col gap-1 mt-2 w-full max-w-xs mx-auto">
          {(activeProjects || []).length > 0 ? (
            (activeProjects || []).map((act) => (
              <div key={act.id} className="bg-[#ffdad8] dark:bg-red-900/30 border border-[#ffb3b0] dark:border-red-900/50 rounded-xl px-3 py-2 flex flex-col items-center">
                 <span className="text-[#98001b] dark:text-[#ffb3b0] font-mono text-xs font-black">
                   Token: {act.ticketNumber}
                 </span>
                 <span className="text-[10px] text-neutral-700 dark:text-neutral-300 font-bold font-urdu truncate max-w-full mt-0.5">
                   {act.projectTitle}
                 </span>
              </div>
            ))
          ) : (
            <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-xs px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
              No Active Tokens
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 w-full mt-5 pt-4 border-t border-[#e2e8f0] dark:border-neutral-700 text-xs">
          <div className="bg-[#f8faf9] dark:bg-neutral-800 p-3 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700">
            <span className="text-[10px] text-[#5b403f] dark:text-neutral-400 block uppercase font-bold">
              {t.activeTokens}
            </span>
            <span className="font-headline font-black text-base text-[#98001b] dark:text-[#ffb3b0]">
              {user.activeTokensCount || 0} Entries
            </span>
          </div>
          <div className="bg-[#f8faf9] dark:bg-neutral-800 p-3 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700">
            <span className="text-[10px] text-[#5b403f] dark:text-neutral-400 block uppercase font-bold">
              {t.totalContributed}
            </span>
            <span className="font-headline font-black text-base text-[#181c1c] dark:text-white">
              PKR {(user.totalPaidAmount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {currentLang === 'sd'
              ? 'پروفائل تفصيل ڪاميابي سان اپڊيٽ ٿي وئي!'
              : currentLang === 'ur'
              ? 'پروفائل کی تفصیلات کامیابی سے اپ ڈیٹ ہو گئیں!'
              : 'Profile details successfully updated!'}
          </span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white dark:bg-[#2d3131] rounded-3xl p-5 border border-[#f1e2e1] dark:border-neutral-700 card-shadow space-y-4">
        <div className="flex justify-between items-center border-b border-[#e2e8f0] dark:border-neutral-700 pb-3">
          <h3 className="font-headline font-bold text-sm text-[#181c1c] dark:text-white uppercase tracking-wider">
            {t.accountInfo}
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-[#98001b] hover:underline flex items-center gap-1 cursor-pointer"
          >
            {isEditing ? (
              <span>{t.cancelBtn}</span>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.editProfile}</span>
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                {t.phone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                {t.cnic}
              </label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                {t.address}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.addressPlaceholder}
                className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-maroon active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{t.submitBtn}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-[#5b403f] dark:text-neutral-400 font-medium">{t.fullName}</span>
              <span className="font-bold text-[#181c1c] dark:text-white">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[#e2e8f0] dark:border-neutral-700">
              <span className="text-[#5b403f] dark:text-neutral-400 font-medium">{t.phone}</span>
              <span className="font-mono font-bold text-[#181c1c] dark:text-white">{user.phoneNumber || user.phone}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[#e2e8f0] dark:border-neutral-700">
              <span className="text-[#5b403f] dark:text-neutral-400 font-medium">{t.cnic}</span>
              <span className="font-mono font-bold text-[#181c1c] dark:text-white">{user.cnic}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[#e2e8f0] dark:border-neutral-700">
              <span className="text-[#5b403f] dark:text-neutral-400 font-medium">{t.email}</span>
              <span className="font-bold text-[#181c1c] dark:text-white">{user.email || 'customer@apnisawari.pk'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[#e2e8f0] dark:border-neutral-700">
              <span className="text-[#5b403f] dark:text-neutral-400 font-medium">Account Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-[10.5px] flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active &bull; Verified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Security & Password Change Card */}
      <div className="bg-white dark:bg-[#2d3131] rounded-3xl p-5 border border-[#f1e2e1] dark:border-neutral-700 card-shadow space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#ffdad8] flex items-center justify-center text-[#98001b]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-[#181c1c] dark:text-white uppercase tracking-wider">
                {t.securityPassword}
              </h3>
              <p className="text-[11px] text-[#5b403f] dark:text-neutral-400 font-medium">
                {t.changePassword}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowPasswordChange(!showPasswordChange);
              setPassError('');
              setPassSuccess(false);
            }}
            className="text-xs font-bold text-[#98001b] hover:underline cursor-pointer bg-[#ffdad8]/50 px-3 py-1.5 rounded-full"
          >
            {showPasswordChange ? t.cancelBtn : t.changePassword}
          </button>
        </div>

        {passSuccess && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 p-3.5 rounded-2xl flex flex-col gap-1 text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{currentLang === 'sd' ? 'درخواست موڪلي وئي' : currentLang === 'ur' ? 'درخواست بھیج دی گئی' : 'Request Sent'}</span>
            </div>
            <p className="font-normal text-emerald-700 pl-6">
              {currentLang === 'sd' 
                ? 'پاسورڊ تبديل ڪرڻ جي درخواست ايڊمن ڏانهن موڪلي وئي آهي. ايڊمن جلد منظوري ڏيندو.'
                : currentLang === 'ur' 
                ? 'پاس ورڈ تبدیل کرنے کی درخواست ایڈمن کو بھیج دی گئی ہے۔ ایڈمن جلد منظور کر لے گا۔'
                : 'Your password change request has been sent to the Admin for approval.'}
            </p>
          </div>
        )}

        {showPasswordChange && (
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-3 pt-2 border-t border-[#e2e8f0] dark:border-neutral-700">
            {passError && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-2xl border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {user.password && (
              <div>
                <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                  Current Password (موجودہ پاس ورڈ)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                {t.password} (نیا پاس ورڈ)
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b] pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-3 text-[#8f6f6e] hover:text-[#181c1c] cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5b403f] dark:text-neutral-400 uppercase mb-1">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
                className="w-full bg-[#f8faf9] dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-maroon active:scale-98 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>{t.updatePasswordBtn}</span>
            </button>
          </form>
        )}
      </div>

      {/* Logout Button */}
      <button
        id="btn-logout"
        onClick={onLogout}
        className="w-full h-12 bg-[#fff8f8] hover:bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#ba1a1a] font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 touch-target"
      >
        <LogOut className="w-4 h-4" />
        <span>{t.logoutBtn}</span>
      </button>

      {/* Profile Photo Edit Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#2d3131] rounded-3xl p-6 max-w-sm w-full border border-[#e0e3e2] dark:border-neutral-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ffdad8] flex items-center justify-center text-[#98001b]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-black text-sm text-[#181c1c] dark:text-white">
                    {t.changePhoto}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {currentLang === 'sd' ? 'پروفائل تصوير چونڊيو' : 'تصویر منتخب کریں یا کیمرہ سے لیں'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {photoError && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-2xl border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}
            {photoSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-2xl border border-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تصویر کامیابی سے محفوظ ہو گئی ہے (Photo synchronized)!</span>
              </div>
            )}

            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#98001b] shadow-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-neutral-400" />
                )}
                {isCompressing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold">
                    Processing...
                  </div>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 mt-2 font-medium">
                Photo Preview / تصویر
              </span>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            {/* Action Buttons: Camera & Gallery */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="bg-[#fed488]/30 hover:bg-[#fed488]/60 border border-[#fed488] text-[#785a1a] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <Camera className="w-5 h-5 text-[#98001b]" />
                <span className="text-xs font-bold">{t.takePhotoCamera}</span>
              </button>

              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="bg-[#f8faf9] dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-[#e2e8f0] dark:border-neutral-600 text-[#181c1c] dark:text-white rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <Upload className="w-5 h-5 text-[#98001b]" />
                <span className="text-xs font-bold">{t.uploadFromGallery}</span>
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isCompressing}
                onClick={handleSavePhoto}
                className="w-full h-11 bg-[#98001b] hover:bg-[#be1e2d] disabled:opacity-50 text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-maroon transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveProfilePhoto}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

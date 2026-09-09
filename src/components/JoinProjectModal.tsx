import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  User,
  Phone,
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  Check,
  Upload,
  Clock,
  Trash2,
  Eye,
  FileCheck,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { VehicleProject, UserProfile, BankAccountDetail, PaymentRecord, UserActiveProject } from '../types';
import { DEFAULT_BANK_ACCOUNTS } from '../data/mockData';
import { getNextMultipleUniqueTokens, getPlanTokenPrefix } from '../lib/tokenService';
import { generatePaymentIdempotencyKey, sanitizeText } from '../lib/security';
import { calculateSchemeArrears } from '../lib/arrearsService';

interface JoinProjectModalProps {
  project: VehicleProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: VehicleProject, tickets: string | string[], paymentRecord?: PaymentRecord) => void;
  onNavigateToTerms: () => void;
  currentUser?: UserProfile | null;
  bankAccounts?: BankAccountDetail[];
  existingActiveProjects?: UserActiveProject[];
}

export const JoinProjectModal: React.FC<JoinProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess,
  onNavigateToTerms,
  currentUser,
  bankAccounts = DEFAULT_BANK_ACCOUNTS,
  existingActiveProjects = []
}) => {
  // Filter out 'cash' / head office counter for customer self-service payment
  const activeAccounts = (bankAccounts || []).filter(
    (b) =>
      b.isActive &&
      b.methodType !== 'cash' &&
      !b.title.toLowerCase().includes('cash counter') &&
      !b.title.toLowerCase().includes('head office')
  );

  // Form Steps: 1 = Details & Token Quantity, 2 = Payment Selection & Account Transfer, 3 = Completed/Pending Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Multiple Tokens State
  const [tokenQuantity, setTokenQuantity] = useState<number>(1);
  const [allocatedTokens, setAllocatedTokens] = useState<Array<{ tokenNumber: number; tokenDisplay: string }>>([]);

  const [fullName, setFullName] = useState(currentUser?.name || currentUser?.full_name || '');
  const [cnic, setCnic] = useState(currentUser?.cnic || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || currentUser?.phone || '');
  const [agreed, setAgreed] = useState(true);

  // Step 2 Payment details
  const [selectedAccountId, setSelectedAccountId] = useState<string>(activeAccounts[0]?.id || 'bank-1');
  const [trxId, setTrxId] = useState('');
  
  // Real File Upload State
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptFileSize, setReceiptFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  // Submission / Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTicketDisplay, setGeneratedTicketDisplay] = useState('');
  const [createdPayment, setCreatedPayment] = useState<PaymentRecord | null>(null);

  // Keep state in sync if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name || currentUser.full_name) setFullName(currentUser.name || currentUser.full_name || '');
      if (currentUser.cnic) setCnic(currentUser.cnic);
      if (currentUser.phoneNumber || currentUser.phone) setPhone(currentUser.phoneNumber || currentUser.phone || '');
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (activeAccounts.length > 0 && !activeAccounts.some((a) => a.id === selectedAccountId)) {
      setSelectedAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts]);

  // Reset modal step and tokens on open with a project
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTokenQuantity(1);
      setAllocatedTokens([]);
      setFormError('');
      setTrxId('');
      setReceiptImage(null);
      setReceiptFileName('');
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const currentSelectedAccount = activeAccounts.find((a) => a.id === selectedAccountId) || activeAccounts[0];
  
  // Arrears calculation for scheme starting in the past
  const arrears = calculateSchemeArrears(project, 0);
  const baseKist = arrears.baseMonthlyKist;
  const totalPayablePerToken = arrears.totalPayablePerToken;
  const totalPayableAmount = totalPayablePerToken * tokenQuantity;

  const paymentLabel = arrears.monthsPassed > 0
    ? `${tokenQuantity} Token${tokenQuantity > 1 ? 's' : ''} - Registration + ${arrears.monthsPassed} Past Overdue Months (Total ${arrears.unpaidMonths} Mos)`
    : `${tokenQuantity} Token${tokenQuantity > 1 ? 's' : ''} - 1st Month Registration Installment`;

  const handleCopyAccount = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processFile = (file: File) => {
    if (!file) return;
    const sizeKB = Math.round(file.size / 1024);
    const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    setReceiptFileName(file.name);
    setReceiptFileSize(formattedSize);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setReceiptImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveReceipt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReceiptImage(null);
    setReceiptFileName('');
    setReceiptFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1 -> Allocate Unique Sequential Tokens & Proceed to Payment
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!agreed) {
      setFormError('براہ کرم شرائط و ضوابط (Terms & Conditions) سے اتفاق کریں۔');
      return;
    }
    if (!fullName.trim()) {
      setFormError('براہ کرم اپنا پورا نام درج کریں۔');
      return;
    }
    if (!phone.trim()) {
      setFormError('براہ کرم اپنا موبائل نمبر درج کریں۔');
      return;
    }
    if (tokenQuantity < 1) {
      setFormError('کم از کم 1 ٹوکن منتخب کریں۔');
      return;
    }

    setIsSubmitting(true);
    try {
      // Allocate unique tokens atomically
      const tokens = await getNextMultipleUniqueTokens(
        project.id,
        tokenQuantity,
        existingActiveProjects,
        project.startDate
      );
      setAllocatedTokens(tokens);
      setGeneratedTicketDisplay(tokens.map(t => t.tokenDisplay).join(', '));
      setStep(2); // Proceed to Step 2 for real payment transfer & slip upload!
    } catch (err) {
      console.error('Error generating tokens:', err);
      const prefix = getPlanTokenPrefix(project.id, project.startDate);
      const fallbackList: Array<{ tokenNumber: number; tokenDisplay: string }> = [];
      for (let i = 1; i <= tokenQuantity; i++) {
        fallbackList.push({
          tokenNumber: i,
          tokenDisplay: `${prefix}-${String(i).padStart(3, '0')}`
        });
      }
      setAllocatedTokens(fallbackList);
      setGeneratedTicketDisplay(fallbackList.map(t => t.tokenDisplay).join(', '));
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 -> Submit Payment for Admin Approval
  const handleFinalPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!trxId.trim()) {
      setFormError('برائے مہربانی ٹرانزیکشن آئی ڈی (Transaction ID / TRX Code) درج کریں۔');
      return;
    }

    setIsSubmitting(true);

    const methodName = currentSelectedAccount
      ? `${currentSelectedAccount.title} (${currentSelectedAccount.accountNumber})`
      : 'Online Transfer';

    setTimeout(() => {
      const cleanTrx = trxId.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
      const formattedTrx = `TRX-${cleanTrx}`;
      const targetUserId = currentUser?.id || currentUser?.uid || `usr-${Date.now()}`;
      const paymentId = generatePaymentIdempotencyKey(targetUserId, formattedTrx, project.title, totalPayableAmount);

      const ticketDisplays = allocatedTokens.length > 0
        ? allocatedTokens.map(t => t.tokenDisplay)
        : [generatedTicketDisplay || 'PENDING_APPROVAL'];

      const payment: PaymentRecord = {
        id: paymentId,
        userId: targetUserId,
        projectId: project.id,
        userToken: ticketDisplays.join(', '),
        userName: sanitizeText(fullName || currentUser?.name || 'Member'),
        projectName: project.title,
        installmentLabel: paymentLabel,
        amount: totalPayableAmount,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        transactionRef: formattedTrx,
        paymentMethod: methodName,
        status: 'UNDER_REVIEW', // Sent to Admin for approval
        receiptUrl: receiptImage || undefined,
        receiptFileName: receiptFileName ? sanitizeText(receiptFileName) : undefined
      };

      setCreatedPayment(payment);
      setIsSubmitting(false);
      setStep(3);

      setTimeout(() => {
        onSuccess(project, ticketDisplays, payment);
      }, 1500);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white text-[#181c1c] w-full max-w-md rounded-2xl shadow-2xl border border-[#e3bebb] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#98001b] text-white px-5 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#fed488]" />
            <div>
              <h3 className="font-['Montserrat'] font-bold text-base">
                {step === 1 ? `Enroll in ${project.title}` : step === 2 ? 'Payment Option & Accounts' : 'Enrollment Submitted!'}
              </h3>
              <p className="text-[10px] text-[#fed488] font-urdu">
                {step === 1 ? 'پلان منتخب کریں اور کوائف کی تصدیق کریں' : step === 2 ? 'رقم ٹرانسفر کریں اور رسید جمع کروائیں' : 'آپ کی رجسٹریشن ہو گئی ہے'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#f1f4f3] px-5 py-2 border-b border-[#e0e3e2] flex items-center justify-between text-xs font-bold font-['Montserrat']">
          <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#98001b]' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#98001b] text-white' : 'bg-neutral-300'}`}>1</span>
            Plan & Tokens
          </span>
          <span className="text-neutral-300">&rarr;</span>
          <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#98001b]' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#98001b] text-white' : 'bg-neutral-300'}`}>2</span>
            Payment & Slip
          </span>
          <span className="text-neutral-300">&rarr;</span>
          <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#98001b]' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#98001b] text-white' : 'bg-neutral-300'}`}>3</span>
            Confirmation
          </span>
        </div>

        {/* STEP 3: SUCCESS & PENDING APPROVAL CONFIRMATION */}
        {step === 3 ? (
          <div className="p-7 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="font-['Montserrat'] font-black text-xl text-[#181c1c]">
                Enrollment & Payment Submitted!
              </h4>
              <p className="text-xs text-emerald-600 font-urdu font-bold mt-1">
                آپ کی رجسٹریشن اور ادائیگی تصدیق کے لیے جمع کر دی گئی ہے
              </p>
            </div>

            <div className="bg-[#f7faf9] border border-[#e0e3e2] p-3.5 rounded-2xl inline-block w-full">
              <div className="space-y-2 text-left">
                <div>
                  <p className="text-[10px] text-[#5b403f] font-semibold uppercase">
                    Assigned Unique Token{allocatedTokens.length > 1 ? 's' : ''} ({allocatedTokens.length} Tokens)
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {allocatedTokens.map(t => (
                      <span key={t.tokenDisplay} className="bg-[#98001b] text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                        {t.tokenDisplay}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#e0e3e2] flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-[#5b403f] font-semibold uppercase">Total Amount</p>
                    <p className="font-['Montserrat'] font-black text-lg text-[#181c1c]">
                      PKR {totalPayableAmount.toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    UNDER REVIEW
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5b403f] font-urdu leading-relaxed">
              ایڈمن کی تصدیق کے بعد آپ کا ٹوکن ایکٹیو ہو جائے گا اور آفیشل رسید جاری ہو جائے گی۔
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs py-3 rounded-full shadow-md cursor-pointer"
            >
              Continue to Dashboard (ڈیش بورڈ پر جائیں)
            </button>
          </div>
        ) : step === 1 ? (
          /* STEP 1: PLAN SELECTION & CUSTOMER INFO CONFIRMATION */
          <form onSubmit={handleProceedToPayment} className="p-5 space-y-4">
            {/* Selected Plan Summary Card */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f7faf9] border border-[#e0e3e2]">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-16 h-14 object-contain shrink-0 bg-white p-1 rounded-xl border border-[#e0e3e2]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-['Montserrat'] font-black text-xs text-[#181c1c] uppercase truncate">
                    {project.title}
                  </h4>
                  <span className="bg-[#fed488] text-[#261900] text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {project.statusBadge}
                  </span>
                </div>
                {project.subtitle && <p className="text-[11px] text-[#5b403f] truncate">{project.subtitle}</p>}
                <p className="text-xs font-black text-[#98001b] mt-0.5">
                  {project.monthlyKist
                    ? `PKR ${project.monthlyKist.toLocaleString()} / Month (${project.durationMonths || 36} Months)`
                    : `Token Price: PKR ${project.tokenPrice?.toLocaleString()}`}
                </p>
              </div>
            </div>

            {/* Token Quantity Selector (1, 2, 3, 4, 5, or more) */}
            <div className="bg-[#f7faf9] border border-[#e0e3e2] p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#181c1c] uppercase">
                    Select Number of Tokens (ٹوکنز کی تعداد)
                  </label>
                  <p className="text-[10px] text-[#5b403f] font-urdu">
                    ہر ٹوکن کو الگ اور منفرد نمبر (Unique Token Number) الاٹ کیا جائے گا۔
                  </p>
                </div>
                <span className="bg-[#98001b] text-white text-xs font-bold px-2.5 py-1 rounded-xl font-mono">
                  {tokenQuantity} {tokenQuantity === 1 ? 'Token' : 'Tokens'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTokenQuantity(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      tokenQuantity === num
                        ? 'bg-[#98001b] text-white border-[#98001b] shadow-xs'
                        : 'bg-white text-[#181c1c] border-[#e0e3e2] hover:border-neutral-400'
                    }`}
                  >
                    {num} {num === 1 ? 'Token' : 'Tokens'}
                  </button>
                ))}
              </div>

              {/* Custom / Stepper control */}
              <div className="flex items-center justify-between pt-1 border-t border-[#e0e3e2] text-xs">
                <span className="text-[#5b403f] font-urdu text-[11px]">یا اپنی مرضی کی تعداد منتخب کریں:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTokenQuantity(prev => Math.max(1, prev - 1))}
                    disabled={tokenQuantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-[#e0e3e2] flex items-center justify-center font-bold text-[#181c1c] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={tokenQuantity}
                    onChange={(e) => setTokenQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-14 text-center font-bold font-mono py-1 rounded-lg bg-white border border-[#e0e3e2] text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTokenQuantity(prev => Math.min(50, prev + 1))}
                    disabled={tokenQuantity >= 50}
                    className="w-7 h-7 rounded-lg bg-white border border-[#e0e3e2] flex items-center justify-center font-bold text-[#181c1c] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scheme Start Arrears Notice */}
            {arrears.monthsPassed > 0 && (
              <div className="bg-[#fff8f8] border border-[#98001b]/30 p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#98001b] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-[#98001b] font-bold leading-relaxed font-urdu">
                      یہ اسکیم {arrears.monthsPassed} ماہ پہلے شروع ہو چکی ہے۔
                      اس میں شامل ہونے کے لیے پچھلے {arrears.overdueMonthsCount} ماہ کے بقایا جات اور موجودہ ماہ کی قسط ملا کر کل {arrears.unpaidMonths} اقساط (PKR {totalPayablePerToken.toLocaleString()} فی ٹوکن) ادا کرنا ہوں گی۔
                    </p>
                    <div className="text-[11px] text-[#5b403f] font-mono">
                      {tokenQuantity > 1 ? (
                        <span>کل واجب الادا ({tokenQuantity} ٹوکنز): {tokenQuantity} &times; PKR {totalPayablePerToken.toLocaleString()} = <strong className="text-[#98001b]">PKR {totalPayableAmount.toLocaleString()}</strong></span>
                      ) : (
                        <span>کل واجب الادا (1 ٹوکن): {arrears.unpaidMonths} Months &times; PKR {baseKist.toLocaleString()} = <strong className="text-[#98001b]">PKR {totalPayableAmount.toLocaleString()}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#98001b]" />
                  Full Name (نام شناختی کارڈ کے مطابق)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#98001b] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1">CNIC Number</label>
                  <input
                    type="text"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="41302-1234567-1"
                    className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2 text-xs font-mono focus:border-[#98001b] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#98001b]" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2 text-xs font-mono focus:border-[#98001b] outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setFormError('');
                  }}
                  className="mt-0.5 w-4 h-4 rounded text-[#98001b] focus:ring-[#98001b] border-[#8f6f6e] accent-[#98001b]"
                />
                <span className="text-xs text-[#5b403f] leading-snug">
                  میں اسکیم کی{' '}
                  <button
                    type="button"
                    onClick={onNavigateToTerms}
                    className="text-[#98001b] font-bold underline hover:text-[#be1e2d]"
                  >
                    شرائط و ضوابط (Terms & Conditions)
                  </button>{' '}
                  سے اتفاق کرتا/کرتی ہوں۔
                </span>
              </label>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl font-urdu">
                ⚠️ {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full gold-gradient text-[#261900] font-['Montserrat'] font-extrabold text-sm py-3.5 rounded-full shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <span>Allocating {tokenQuantity} Unique Token{tokenQuantity > 1 ? 's' : ''}...</span>
              ) : (
                <>
                  <span>PROCEED TO PAYMENT (ادائیگی کے لیے آگے بڑھیں - PKR {totalPayableAmount.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: PAYMENT OPTION & ACCOUNT DETAILS */
          <form onSubmit={handleFinalPaymentSubmit} className="p-5 space-y-4">
            {/* Generated Unique Tokens Banner */}
            <div className="bg-[#181c1c] text-white p-3.5 rounded-2xl border border-[#fed488]/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#fed488] font-bold uppercase block">
                    Allotted Unique Token{allocatedTokens.length > 1 ? 's' : ''} ({allocatedTokens.length} Tokens)
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {allocatedTokens.map((t) => (
                      <span key={t.tokenDisplay} className="font-['Montserrat'] font-black text-xs bg-white/20 text-[#fed488] px-2 py-0.5 rounded-md font-mono border border-[#fed488]/30">
                        {t.tokenDisplay}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-neutral-400 uppercase block">Total Amount Due</span>
                  <span className="font-['Montserrat'] font-black text-base text-[#fed488]">
                    PKR {totalPayableAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {arrears.monthsPassed > 0 && (
                <p className="text-[10.5px] text-neutral-300 font-urdu border-t border-white/10 pt-1.5 leading-relaxed">
                  ℹ️ {allocatedTokens.length} ٹوکنز کے لیے {arrears.monthsPassed} پچھلے بقایا ماہ + 1 موجودہ ماہ = کل {arrears.unpaidMonths} اقساط فی ٹوکن کی رقم۔
                </p>
              )}
            </div>

            {/* Payment Method Selector (EasyPaisa, JazzCash, Bank) */}
            <div>
              <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1.5">
                Select Payment Account / رقم بھیجنے کا اکاؤنٹ منتخب کریں
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeAccounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-start gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#98001b] bg-[#fff8f8] ring-1 ring-[#98001b]'
                          : 'border-[#e0e3e2] bg-[#f7faf9] hover:bg-neutral-100'
                      }`}
                    >
                      {acc.methodType === 'easypaisa' && <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                      {acc.methodType === 'jazzcash' && <Smartphone className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                      {acc.methodType === 'bank' && <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#181c1c] truncate">{acc.title}</p>
                        <p className="text-[10px] font-mono text-[#5b403f] truncate">{acc.accountNumber}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Account Details & Copy Box */}
              {currentSelectedAccount && (
                <div className="mt-3 p-3 rounded-xl bg-[#ebeeed] border border-[#e0e3e2] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#181c1c]">{currentSelectedAccount.title}</span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-[#98001b] font-bold">
                      {currentSelectedAccount.bankName || currentSelectedAccount.accountTitle}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#e0e3e2]">
                    <div>
                      <p className="text-[10px] text-[#5b403f]">
                        Account Title: <strong>{currentSelectedAccount.accountTitle}</strong>
                      </p>
                      <p className="font-mono font-bold text-[#181c1c] text-xs select-all">
                        {currentSelectedAccount.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(currentSelectedAccount.accountNumber)}
                      className="text-[#98001b] hover:text-[#be1e2d] flex items-center gap-1 text-[11px] font-bold py-1 px-2 rounded bg-[#ffdad8]/40 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {currentSelectedAccount.instructions && (
                    <p className="text-[10px] text-[#5b403f] leading-tight font-urdu">
                      ℹ️ {currentSelectedAccount.instructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* TRX ID Input & Slip Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#181c1c] uppercase">
                Transaction ID / TRX Code (رقم ٹرانسفر کا حوالہ نمبر)
              </label>
              <input
                type="text"
                placeholder="مثال: 99824158291 یا TRX کوڈ"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2 text-xs font-mono focus:border-[#98001b] outline-none"
                required
              />

              {/* REAL FILE PICKER INPUT (Hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* UPLOAD ZONE WITH REAL PREVIEW */}
              {receiptImage ? (
                <div className="border border-emerald-300 bg-emerald-50/70 rounded-xl p-3 flex items-center gap-3 transition-all animate-in fade-in">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 bg-white flex items-center justify-center">
                    {receiptImage.startsWith('data:image') ? (
                      <img src={receiptImage} alt="Receipt Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileCheck className="w-7 h-7 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        ✓ Slip Attached
                      </span>
                      <span className="text-[10px] text-emerald-800 font-mono">{receiptFileSize}</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-950 truncate mt-1">
                      {receiptFileName || 'payment_receipt.jpg'}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-urdu">تصویر کامیابی سے منسلک ہو چکی ہے</p>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    {receiptImage.startsWith('data:image') && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalOpen(true)}
                        className="p-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                        title="View Full Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 cursor-pointer"
                      title="Remove Receipt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#98001b] bg-[#ffdad8]/30 scale-[1.01]'
                      : 'border-[#e0e3e2] hover:border-[#98001b] bg-[#f7faf9] hover:bg-[#fff8f8]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#ffdad8]/60 text-[#98001b] flex items-center justify-center mx-auto mb-1">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#181c1c]">
                    Click to browse or drag & drop payment screenshot / slip
                  </p>
                  <p className="text-[10px] text-[#5b403f] font-urdu">
                    جاز کیش، ایزی پیسہ یا بینک سلپ کی تصویر/اسکرین شاٹ یہاں منسلک کریں
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#fed488]/30 border border-[#fed488] p-2.5 rounded-xl flex items-center gap-2 text-xs text-[#785a1a]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-urdu text-[11px] leading-snug">
                رقم بھیجنے کے بعد سبمٹ کریں۔ ایڈمن پورٹل پر چیک کر کے آپ کی رسید منظور (PAID) کرے گا۔
              </span>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl font-urdu">
                ⚠️ {formError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-full border border-neutral-300 font-bold text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Back (واپس)
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white font-['Montserrat'] font-bold text-xs py-3.5 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                {isSubmitting ? (
                  <span>Submitting to Admin...</span>
                ) : (
                  <>
                    <span>SUBMIT FOR ADMIN APPROVAL (PKR {totalPayableAmount.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FULL IMAGE PREVIEW MODAL */}
      {previewModalOpen && receiptImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 border-b">
              <span className="text-xs font-bold">{receiptFileName || 'Payment Slip'}</span>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2">
              <img src={receiptImage} alt="Payment Receipt" className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

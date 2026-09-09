import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Upload,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Building2,
  Banknote,
  Copy,
  Check,
  Image as ImageIcon,
  Trash2,
  Eye,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { PaymentRecord, PaymentStatus, BankAccountDetail, UserProfile, UserActiveProject, VehicleProject } from '../types';
import { DEFAULT_BANK_ACCOUNTS } from '../data/mockData';
import { sanitizeText, generatePaymentIdempotencyKey } from '../lib/security';
import { calculateSchemeArrears } from '../lib/arrearsService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: PaymentRecord) => void;
  defaultProject?: string;
  defaultAmount?: number;
  defaultLabel?: string;
  defaultTokenNumber?: string;
  bankAccounts?: BankAccountDetail[];
  currentUser?: UserProfile | null;
  isAdmin?: boolean;
  activeProjects?: UserActiveProject[];
  allProjects?: VehicleProject[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultProject = 'HONDA CD70 COMMITTEE',
  defaultAmount = 5000,
  defaultLabel = '1st Monthly Installment',
  defaultTokenNumber = '',
  bankAccounts = DEFAULT_BANK_ACCOUNTS,
  currentUser,
  isAdmin = false,
  activeProjects = [],
  allProjects = []
}) => {
  // Requirement 3: Customer payment options ONLY show EasyPaisa, JazzCash, and Bank.
  // "Head Office Cash Counter" is strictly restricted to Admin portal.
  const activeAccounts = (bankAccounts || []).filter((b) => {
    if (!b.isActive) return false;
    if (!isAdmin && (b.methodType === 'cash' || b.title.toLowerCase().includes('cash counter') || b.title.toLowerCase().includes('head office'))) {
      return false;
    }
    return true;
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    activeAccounts[0]?.id || 'bank-1'
  );
  const [amount, setAmount] = useState(defaultAmount);
  const [projectName, setProjectName] = useState(defaultProject);
  const [installmentLabel, setInstallmentLabel] = useState(defaultLabel);
  const [tokenNumber, setTokenNumber] = useState(defaultTokenNumber || '');
  const [transactionId, setTransactionId] = useState('');

  const getOrdinalSuffix = (i: number) => {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Find currently selected active project and arrears
  const selectedActiveProject = (activeProjects || []).find(
    p => (tokenNumber && p.ticketNumber === tokenNumber) || p.projectTitle === projectName
  );
  const matchingScheme = (allProjects || []).find(
    op => op.id === selectedActiveProject?.projectId || op.title === selectedActiveProject?.projectTitle || op.title === projectName
  );
  const arrearsInfo = calculateSchemeArrears(matchingScheme, selectedActiveProject?.completedUnits || 0);

  // Update selected project/token and auto-calculate past installments
  const handleProjectSelect = (selectedValue: string) => {
    const proj = (activeProjects || []).find(p => p.ticketNumber === selectedValue || p.projectTitle === selectedValue);
    if (proj) {
      setProjectName(proj.projectTitle);
      setTokenNumber(proj.ticketNumber || '');
      const match = (allProjects || []).find(op => op.id === proj.projectId || op.title === proj.projectTitle);
      const arr = calculateSchemeArrears(match, proj.completedUnits || 0);
      if (arr.unpaidMonths > 1 && arr.monthsPassed > 0) {
        setAmount(arr.totalPayablePerToken);
        setInstallmentLabel(`${arr.unpaidMonths} Months (Including ${arr.overdueMonthsCount} Past Overdue Months)`);
      } else {
        const nextNum = (proj.completedUnits || 0) + 1;
        setInstallmentLabel(`${nextNum}${getOrdinalSuffix(nextNum)} Installment / Token`);
        setAmount(proj.monthlyKist || proj.tokenAmount || 5000);
      }
    } else {
      setProjectName(selectedValue);
      setInstallmentLabel('Installment / Token');
      setTokenNumber('');
    }
  };
  
  // Real File Upload State
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptFileSize, setReceiptFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state if default values change or when modal opens
  React.useEffect(() => {
    if (defaultProject) setProjectName(defaultProject);
    if (defaultTokenNumber) setTokenNumber(defaultTokenNumber);

    const proj = (activeProjects || []).find(p => (defaultTokenNumber && p.ticketNumber === defaultTokenNumber) || p.projectTitle === defaultProject);
    const match = (allProjects || []).find(op => op.id === proj?.projectId || op.title === proj?.projectTitle || op.title === defaultProject);
    const arr = calculateSchemeArrears(match, proj?.completedUnits || 0);

    if (arr.unpaidMonths > 1 && arr.monthsPassed > 0) {
      setAmount(arr.totalPayablePerToken);
      setInstallmentLabel(`${arr.unpaidMonths} Months (Including ${arr.overdueMonthsCount} Past Overdue Months)`);
    } else {
      if (defaultAmount) setAmount(defaultAmount);
      if (defaultLabel) setInstallmentLabel(defaultLabel);
    }

    if (activeAccounts.length > 0 && !activeAccounts.some(a => a.id === selectedAccountId)) {
      setSelectedAccountId(activeAccounts[0].id);
    }
  }, [defaultProject, defaultAmount, defaultLabel, defaultTokenNumber, activeAccounts, isOpen]);

  if (!isOpen) return null;

  const currentSelectedAccount = activeAccounts.find(a => a.id === selectedAccountId) || activeAccounts[0];

  const handleCopyAccount = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processFile = (file: File) => {
    if (!file) return;
    
    // Format file size
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const methodName = currentSelectedAccount
      ? `${currentSelectedAccount.title} (${currentSelectedAccount.accountNumber})`
      : 'Direct Transfer';

    const cleanTrx = sanitizeText(transactionId).replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanProject = sanitizeText(projectName);

    setTimeout(() => {
      const targetUserId = currentUser?.id || currentUser?.uid || '';
      const formattedTrx = cleanTrx ? `TRX-${cleanTrx.toUpperCase()}` : `TRX-${Math.floor(10000 + Math.random() * 90000)}-M`;
      const paymentId = generatePaymentIdempotencyKey(targetUserId, formattedTrx, cleanProject, Math.max(1, Number(amount)));

      const newPayment: PaymentRecord = {
        id: paymentId,
        userId: targetUserId,
        userToken: sanitizeText(tokenNumber) || '',
        userName: sanitizeText(currentUser?.name || currentUser?.full_name || 'Member'),
        projectName: cleanProject,
        installmentLabel: sanitizeText(installmentLabel),
        amount: Math.max(1, Number(amount)),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        transactionRef: formattedTrx,
        paymentMethod: methodName,
        status: 'UNDER_REVIEW' as PaymentStatus,
        receiptUrl: receiptImage || undefined,
        receiptFileName: receiptFileName ? sanitizeText(receiptFileName) : undefined
      };

      setIsSubmitting(false);
      setIsDone(true);

      setTimeout(() => {
        onSuccess(newPayment);
        setIsDone(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white text-[#181c1c] w-full max-w-md rounded-2xl shadow-2xl border border-[#e3bebb] overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#98001b] text-white px-5 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#fed488]" />
            <h3 className="font-['Montserrat'] font-bold text-base">Make Installment / Token Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-['Montserrat'] font-bold text-xl text-[#181c1c]">Payment Submitted!</h4>
            <p className="text-sm text-[#5b403f] font-urdu">
              آپ کی رسید اور اسکرین شاٹ تصدیق کے لیے ایڈمن کو بھیج دی گئی ہے (Pending Approval)۔ ایڈمن کی منظوری کے بعد آفیشل رسید جاری ہو جائے گی۔
            </p>
            <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
              Status: UNDER REVIEW (منظوری کے منتظر)
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1">Selected Scheme / Plan</label>
              {(activeProjects || []).length > 0 && !isAdmin ? (
                <>
                <select
                  value={tokenNumber}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2.5 text-xs font-bold text-[#181c1c] outline-none cursor-pointer"
                >
                  <option value="" disabled>Select a token...</option>
                  {(activeProjects || []).map((p) => (
                    <option key={p.id} value={p.ticketNumber}>{p.ticketNumber} - {p.projectTitle} (PKR {p.monthlyKist?.toLocaleString()}/mo)</option>
                  ))}
                </select>
                
                {tokenNumber && (
                  <div className="mt-3 space-y-2.5">
                    {/* Arrears Notification Alert */}
                    {arrearsInfo.unpaidMonths > 1 && arrearsInfo.monthsPassed > 0 && (
                      <div className="bg-[#fff8f8] border border-[#98001b]/30 p-3 rounded-xl space-y-1">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-[#98001b] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-[#98001b] font-bold font-urdu leading-relaxed">
                              یہ اسکیم {arrearsInfo.monthsPassed} ماہ پہلے شروع ہو چکی ہے۔
                              سسٹم نے پچھلی {arrearsInfo.overdueMonthsCount} اقساط اور موجودہ ماہ کی قسط ملا کر کل {arrearsInfo.unpaidMonths} اقساط (PKR {arrearsInfo.totalPayablePerToken.toLocaleString()}) خودکار طور پر تیار کر دی ہے۔
                            </p>
                            <p className="text-[11px] text-[#5b403f] font-mono mt-0.5">
                              Auto-Generated Total: {arrearsInfo.unpaidMonths} Months &times; PKR {arrearsInfo.baseMonthlyKist.toLocaleString()} = PKR {arrearsInfo.totalPayablePerToken.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="block text-xs font-bold text-neutral-500 uppercase">
                      Select Number of Months / ادا کی جانے والی اقساط
                    </label>

                    {/* Quick Button for Full Arrears if applicable */}
                    {arrearsInfo.unpaidMonths > 1 && arrearsInfo.monthsPassed > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAmount(arrearsInfo.totalPayablePerToken);
                          setInstallmentLabel(`${arrearsInfo.unpaidMonths} Months (Including ${arrearsInfo.overdueMonthsCount} Past Overdue Months)`);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-between cursor-pointer ${
                          amount === arrearsInfo.totalPayablePerToken
                            ? 'bg-[#98001b] text-white border-[#98001b] shadow-xs'
                            : 'bg-[#fff8f8] text-[#98001b] border-[#98001b]/40 hover:bg-[#ffdad8]/30'
                        }`}
                      >
                        <span className="font-urdu text-right">
                          ✓ کل تمام واجب الادا اقساط ادا کریں ({arrearsInfo.unpaidMonths} ماہ)
                        </span>
                        <span className="font-mono font-bold">
                          PKR {arrearsInfo.totalPayablePerToken.toLocaleString()}
                        </span>
                      </button>
                    )}

                    <div className="flex gap-2 items-center">
                      {[1, 2, 3, 4, 5].map(num => {
                        const act = activeProjects.find(p => p.ticketNumber === tokenNumber);
                        const kist = act?.monthlyKist || arrearsInfo.baseMonthlyKist || 5000;
                        const isCurrentSelected = amount === kist * num;

                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setAmount(kist * num);
                              setInstallmentLabel(`${num} Month${num > 1 ? 's' : ''} Installment`);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors cursor-pointer ${
                              isCurrentSelected
                                ? 'bg-[#98001b] text-white border-[#98001b]' 
                                : 'bg-white dark:bg-[#2d3131] text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                            }`}
                          >
                            {num} {num === 1 ? 'Mo' : 'Mos'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                </>
                
              ) : (
                <input
                  type="text"
                  value={projectName}
                  readOnly
                  className="w-full bg-[#ebeeed] border border-[#e0e3e2] rounded-xl px-3 py-2.5 text-xs font-bold text-[#181c1c] outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1">Installment Label (تفصیل)</label>
              <input
                type="text"
                value={installmentLabel}
                onChange={(e) => setInstallmentLabel(e.target.value)}
                placeholder="e.g. Month 1 / Token Price"
                className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2.5 text-xs font-bold text-[#181c1c] focus:border-[#98001b] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#f7faf9] border border-[#e0e3e2] rounded-xl px-3 py-2.5 text-sm font-bold text-[#98001b] focus:border-[#98001b] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#181c1c] uppercase mb-1">Token Number (ٹکن نمبر)</label>
                <input
                  type="text"
                  value={tokenNumber || 'TK-2026-001'}
                  readOnly
                  className="w-full bg-[#ebeeed] border border-[#e0e3e2] rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#5b403f] outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector (Strictly Easypaisa, Jazzcash, Bank for customers) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#181c1c] uppercase">Official Payment Accounts</label>
                <span className="text-[10px] text-[#98001b] font-bold">Transfer amount below</span>
              </div>

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
                      {acc.methodType === 'cash' && <Banknote className="w-4 h-4 text-[#775a19] shrink-0 mt-0.5" />}

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
                      <p className="text-[10px] text-[#5b403f]">Account Title: <strong>{currentSelectedAccount.accountTitle}</strong></p>
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

            {/* Transaction ID & Receipt Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#181c1c] uppercase">
                Transaction ID / TRX Reference (رقم بھیجنے کا حوالہ نمبر)
              </label>
              <input
                type="text"
                placeholder="e.g. 99824158291 یا TRX کوڈ"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
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
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#98001b] bg-[#ffdad8]/30 scale-[1.01]'
                      : 'border-[#e0e3e2] hover:border-[#98001b] bg-[#f7faf9] hover:bg-[#fff8f8]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#ffdad8]/60 text-[#98001b] flex items-center justify-center mx-auto mb-1.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#181c1c]">
                    Click to browse or drag & drop payment screenshot / slip
                  </p>
                  <p className="text-[11px] text-[#5b403f] font-urdu mt-0.5">
                    جاز کیش، ایزی پیسہ یا بینک سلپ کی تصویر/اسکرین شاٹ یہاں منسلک کریں (JPG, PNG, PDF)
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#fed488]/30 border border-[#fed488] p-2.5 rounded-xl flex items-center gap-2 text-xs text-[#785a1a]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-urdu text-[11px] leading-snug">
                رقم بھیجنے کے بعد ٹرانزیکشن جمع کروائیں۔ ایڈمن ویریفائی کر کے رسید منظور (PAID) کرے گا۔
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#98001b] hover:bg-[#be1e2d] text-white font-['Montserrat'] font-bold text-sm py-3 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {isSubmitting ? (
                <span>Submitting Transaction to Admin...</span>
              ) : (
                <>
                  <span>SUBMIT PAYMENT (PKR {amount.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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


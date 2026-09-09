import React, { useState, useRef } from 'react';
import {
  Users,
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Search,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Edit,
  Trash2,
  Building2,
  Smartphone,
  Banknote,
  Check,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Save,
  Eye,
  EyeOff,
  UserPlus,
  Car,
  Receipt,
  Sparkles,
  X,
  FileText,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Camera,
  Layers,
  CheckCircle,
  Play
} from 'lucide-react';
import {
  UserProfile,
  PaymentRecord,
  VehicleProject,
  WinnerRecord,
  BankAccountDetail,
  TermSection,
  UserActiveProject
} from '../types';
import { EXACT_TERMS_SECTIONS } from '../data/mockData';
import { compressImageToDataUrl } from '../lib/imageCompressor';
import { LanguageType, TRANSLATIONS } from '../lib/translations';
import { AdminCustomersSection } from '../components/AdminCustomersSection';
import { AdminApprovalsSection } from '../components/AdminApprovalsSection';
import { AdminStatementsSection } from '../components/AdminStatementsSection';
import { AdminLiveDrawModal } from '../components/AdminLiveDrawModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AdminTokenLedgerSection } from "../components/AdminTokenLedgerSection";

interface AdminViewProps {
  onBack: () => void;
  onLockAdmin?: () => void;
  onPreviewCustomerView?: () => void;
  onResetAllData?: () => void;
  adminToken?: string | null;
  onUpdateAdminPin?: (newPin: string) => Promise<boolean> | void;
  users: UserProfile[];
  payments: PaymentRecord[];
  projects: VehicleProject[];
  winners: WinnerRecord[];
  bankAccounts: BankAccountDetail[];
  activeProjects?: UserActiveProject[];
  terms?: TermSection[];
  onUpdateTerms?: (terms: TermSection[]) => void;
  onApprovePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason: string) => void;
  onAddProject: (project: VehicleProject) => void;
  onUpdateProject?: (project: VehicleProject) => void;
  onDeleteProject?: (projectId: string) => void;
  onDeleteActiveProject?: (tokenId: string) => void;
  onUpdateActiveProject?: (updated: UserActiveProject) => void;
  onAddUser?: (user: UserProfile) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onDeleteUser?: (userId: string) => void;
  onAddPayment?: (payment: PaymentRecord) => void;
  onUpdatePayment?: (payment: PaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
  onAddWinner: (winner: WinnerRecord) => void;
  onUpdateWinner?: (winner: WinnerRecord) => void;
  onDeleteWinner?: (winnerId: string) => void;
  onUpdateBankAccount: (account: BankAccountDetail) => void;
  onAddBankAccount: (account: BankAccountDetail) => void;
  onDeleteBankAccount: (accountId: string) => void;
  currentLang?: LanguageType;
  onLangChange?: (lang: LanguageType) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBack,
  onLockAdmin,
  onPreviewCustomerView,
  onResetAllData,
  adminToken,
  onUpdateAdminPin,
  users,
  payments,
  projects,
  winners,
  bankAccounts,
  activeProjects = [],
  terms = EXACT_TERMS_SECTIONS,
  onUpdateTerms,
  onApprovePayment,
  onRejectPayment,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onDeleteActiveProject,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onAddWinner,
  onUpdateWinner,
  onDeleteWinner,
  onUpdateBankAccount,
  onAddBankAccount,
  onDeleteBankAccount,
  currentLang = 'ur',
  onLangChange
}) => {
  const [activeSection, setActiveSection] = useState<
    'ledger' | 'approvals' | 'overview' | 'projects' | 'users' | 'payments' | 'statements' | 'winners' | 'accounts' | 'security' | 'terms'
  >('approvals');

  const [showLiveBallotModal, setShowLiveBallotModal] = useState<boolean>(false);

  // Slip screenshot preview modal
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [viewingSlipTitle, setViewingSlipTitle] = useState<string>('');

  // Delete Confirmation Modals State (replaces broken window.confirm)
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('Invalid receipt / mismatched TRX ID');
  const [projectToDelete, setProjectToDelete] = useState<VehicleProject | null>(null);
  const [winnerToDelete, setWinnerToDelete] = useState<WinnerRecord | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<BankAccountDetail | null>(null);

  // 1. PIN Settings State
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinChangeSaved, setPinChangeSaved] = useState(false);
  const [pinChangeError, setPinChangeError] = useState('');

  // 2. Modals state for CRUD
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<VehicleProject | null>(null);
  const [projectFormData, setProjectFormData] = useState<Partial<VehicleProject>>({});
  const [isProjectImageCompressing, setIsProjectImageCompressing] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProjectImageCompressing(true);
      const compressed = await compressImageToDataUrl(file, 800, 600, 0.85);
      setProjectFormData((prev) => ({ ...prev, imageUrl: compressed }));
    } catch (err) {
      console.error('Error compressing project image:', err);
    } finally {
      setIsProjectImageCompressing(false);
    }
  };

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<UserProfile>>({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<Partial<PaymentRecord>>({});
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [editingWinner, setEditingWinner] = useState<WinnerRecord | null>(null);
  const [winnerFormData, setWinnerFormData] = useState<Partial<WinnerRecord>>({});

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountDetail | null>(null);
  const [accountFormData, setAccountFormData] = useState<Partial<BankAccountDetail>>({});

  // 3. Terms Edit Modal State
  const [showTermModal, setShowTermModal] = useState(false);
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  const [termFormData, setTermFormData] = useState<{ number: string; title: string; paragraphsText: string }>({
    number: '',
    title: '',
    paragraphsText: ''
  });

  // Calculate high-level financial metrics
  const totalCollected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = (payments || []).filter(
    (p) => p.status === 'UNDER_REVIEW' || p.status === 'PENDING'
  );

  // -------------------------------------------------------------
  // OPEN MODAL HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectFormData({
      title: 'HONDA CD 70cc (2026)',
      subtitle: '70cc Fuel Efficient Bike',
      category: 'committee',
      vehicleType: 'bike',
      tokenPrice: 5000,
      monthlyKist: 5000,
      durationMonths: 24,
      totalMembers: 450,
      statusBadge: 'Booking Open',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      description: 'Zero meter brand new Honda CD 70 with complete documents, manufacturer warranty and registration support.',
      qurstandaziBenefit: '              !',
      nonWinnersRefundText: '100% Refund guaranteed or brand new vehicle delivery on scheme maturity completion.',
      specs: {
        engine: '70cc 4-Stroke Air-Cooled',
        transmission: '4-Speed Constant Mesh',
        fuelCapacity: '9.0 Liters',
        mileage: '60+ KM/L',
        warranty: '3 Years / 20,000 KM'
      },
      features: ['Brand New Zero Meter', 'Complete Original Documents', 'Self & Kick Start', 'Digital Meter']
    });
    setShowProjectModal(true);
  };

  const handleOpenEditProject = (proj: VehicleProject) => {
    setEditingProject(proj);
    setProjectFormData({
      ...proj,
      category: proj.category || 'committee',
      vehicleType: proj.vehicleType || 'bike',
      specs: proj.specs || {
        engine: '70cc 4-Stroke',
        transmission: '4-Speed Mesh',
        fuelCapacity: '9.0L',
        mileage: '60 KM/L',
        warranty: '3 Years'
      },
      features: proj.features || ['Brand New', 'Original Documents'],
      description: proj.description || '',
      qurstandaziBenefit: proj.qurstandaziBenefit || '            !',
      nonWinnersRefundText: proj.nonWinnersRefundText || '100% Refund guaranteed or vehicle on scheme maturity'
    });
    setShowProjectModal(true);
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    const nextTokenNum = String((users || []).length + 1).padStart(3, '0');
    setUserFormData({
      name: '',
      memberId: `USR-${Date.now().toString().slice(-4)}`,
      phone: '',
      cnic: '',
      email: '',
      address: '',
      password: 'user123',
      totalPaidAmount: 0,
      activeTokensCount: 1,
      account_status: 'active',
      avatarUrl: ''
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setUserFormData({ ...u });
    setShowUserModal(true);
  };

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    const firstUser = users[0];
    const firstProj = projects[0];
    const firstAccount = bankAccounts[0];

    setPaymentFormData({
      userName: firstUser ? firstUser.name : '',
      userToken: firstUser ? firstUser.memberId : '',
      userId: firstUser ? (firstUser.id || firstUser.uid || '') : '',
      projectName: firstProj ? firstProj.title : 'HONDA CD 70cc (2026)',
      installmentLabel: 'Month 1 / Token Price',
      amount: firstProj ? (firstProj.monthlyKist || firstProj.tokenPrice || 5000) : 5000,
      date: new Date().toISOString().split('T')[0],
      transactionRef: `MAN-${Date.now().toString().slice(-6)}`,
      paymentMethod: firstAccount ? `${firstAccount.title} (${firstAccount.accountNumber})` : 'Head Office Cash Counter',
      status: 'PAID',
      receiptUrl: ''
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (p: PaymentRecord) => {
    setEditingPayment(p);
    setPaymentFormData({ ...p });
    setShowPaymentModal(true);
  };

  const handleOpenAddWinner = () => {
    setEditingWinner(null);
    setWinnerFormData({
      name: '',
      memberId: 'TK-2026-001',
      ticketNumber: 'TKT-01',
      prizeWon: 'HONDA CD 70cc (2026)',
      date: new Date().toISOString().split('T')[0],
      city: 'Hyderabad',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      drawMonth: 'March 2026'
    });
    setShowWinnerModal(true);
  };

  const handleOpenEditWinner = (w: WinnerRecord) => {
    setEditingWinner(w);
    setWinnerFormData({ ...w });
    setShowWinnerModal(true);
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData({
      title: 'Meezan Bank Account',
      accountTitle: 'Apni Sawari Scheme Pvt Ltd',
      accountNumber: '02010108923412',
      bankName: 'Meezan Bank',
      branchOrIban: 'PK52MEZN0002010108923412',
      methodType: 'bank',
      instructions: 'Please transfer payment and upload screenshot.',
      isActive: true
    });
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: BankAccountDetail) => {
    setEditingAccount(acc);
    setAccountFormData({ ...acc });
    setShowAccountModal(true);
  };

  // -------------------------------------------------------------
  // SAVE FORM SUBMISSION HANDLERS
  // -------------------------------------------------------------
  const handleSaveProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.title) return;

    const payload: VehicleProject = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      title: projectFormData.title || 'New Scheme',
      subtitle: projectFormData.subtitle || 'Vehicle Scheme',
      tokenPrice: projectFormData.tokenPrice === "" || projectFormData.tokenPrice === undefined ? 0 : Number(projectFormData.tokenPrice),
      tokenAmount: projectFormData.tokenPrice === "" || projectFormData.tokenPrice === undefined ? 0 : Number(projectFormData.tokenPrice),
      monthlyKist: projectFormData.monthlyKist === "" || projectFormData.monthlyKist === undefined ? 0 : Number(projectFormData.monthlyKist),
      installmentAmount: projectFormData.monthlyKist === "" || projectFormData.monthlyKist === undefined ? 0 : Number(projectFormData.monthlyKist),
      durationMonths: projectFormData.durationMonths === "" || projectFormData.durationMonths === undefined ? 0 : Number(projectFormData.durationMonths),
      totalMembers: projectFormData.totalMembers === "" || projectFormData.totalMembers === undefined ? 0 : Number(projectFormData.totalMembers),
      statusBadge: projectFormData.statusBadge || 'Booking Open',
      category: projectFormData.category || 'committee',
      vehicleType: projectFormData.vehicleType || 'bike',
      imageUrl:
        projectFormData.imageUrl ||
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      description: projectFormData.description || '',
      qurstandaziBenefit:
        projectFormData.qurstandaziBenefit ||
        '             !',
      nonWinnersRefundText:
        projectFormData.nonWinnersRefundText ||
        '100% Refund guaranteed or vehicle on scheme maturity',
      specs: projectFormData.specs || {
        engine: '70cc 4-Stroke',
        transmission: 'Manual',
        fuelCapacity: '9L',
        mileage: '60 KM/L',
        warranty: '3 Years'
      },
      features: projectFormData.features || ['Brand New', 'Original Documents']
    };

    if (editingProject && onUpdateProject) {
      onUpdateProject(payload);
    } else {
      onAddProject(payload);
    }
    setShowProjectModal(false);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name) return;

    if (editingUser && onUpdateUser) {
      onUpdateUser({ ...editingUser, ...userFormData } as UserProfile);
    } else if (onAddUser) {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: userFormData.name || 'Member',
        memberId: userFormData.memberId || `USR-${Date.now().toString().slice(-4)}`,
        phone: userFormData.phone || userFormData.phoneNumber || '',
        phoneNumber: userFormData.phone || userFormData.phoneNumber || '',
        cnic: userFormData.cnic || '',
        email: userFormData.email || '',
        address: userFormData.address || '',
        password: userFormData.password || 'user123',
        totalPaidAmount: userFormData.totalPaidAmount || 0,
        activeTokensCount: userFormData.activeTokensCount || 1,
        account_status: userFormData.account_status || 'active',
        avatarUrl: userFormData.avatarUrl || ''
      };
      onAddUser(newUser);
    }
    setShowUserModal(false);
  };

  const handleSavePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFormData.amount) return;

    if (editingPayment && onUpdatePayment) {
      onUpdatePayment({ ...editingPayment, ...paymentFormData } as PaymentRecord);
    } else if (onAddPayment) {
      const newPay: PaymentRecord = {
        id: `pay-${Date.now()}`,
        userName: paymentFormData.userName || 'Member',
        userToken: paymentFormData.userToken || 'TK-2026-001',
        userId: paymentFormData.userId || '',
        projectName: paymentFormData.projectName || 'HONDA CD 70cc (2026)',
        installmentLabel: paymentFormData.installmentLabel || 'Month 1',
        amount: Number(paymentFormData.amount) || 5000,
        date: paymentFormData.date || new Date().toISOString().split('T')[0],
        transactionRef: paymentFormData.transactionRef || `TRX-${Date.now().toString().slice(-6)}`,
        paymentMethod: paymentFormData.paymentMethod || 'Head Office Cash Counter',
        status: paymentFormData.status || 'PAID',
        receiptUrl: paymentFormData.receiptUrl || ''
      };
      onAddPayment(newPay);

      // If approved, update user balance & active project units
      if (newPay.status === 'PAID') {
        onApprovePayment(newPay.id);
      }
    }
    setShowPaymentModal(false);
  };

  const handleSaveWinnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerFormData.name) return;

    if (editingWinner && onUpdateWinner) {
      onUpdateWinner({ ...editingWinner, ...winnerFormData } as WinnerRecord);
    } else {
      const newWin: WinnerRecord = {
        id: `win-${Date.now()}`,
        name: winnerFormData.name || 'Winner Member',
        memberId: winnerFormData.memberId || 'TK-2026-001',
        ticketNumber: winnerFormData.ticketNumber || 'TKT-01',
        prizeWon: winnerFormData.prizeWon || 'HONDA CD 70cc (2026)',
        date: winnerFormData.date || new Date().toISOString().split('T')[0],
        city: winnerFormData.city || 'Hyderabad',
        photoUrl: winnerFormData.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        drawMonth: winnerFormData.drawMonth || 'Draw Result'
      };
      onAddWinner(newWin);
    }
    setShowWinnerModal(false);
  };

  const handleSaveAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.title) return;

    if (editingAccount) {
      onUpdateBankAccount({ ...editingAccount, ...accountFormData } as BankAccountDetail);
    } else {
      const newAcc: BankAccountDetail = {
        id: `acc-${Date.now()}`,
        title: accountFormData.title || 'Bank Account',
        accountTitle: accountFormData.accountTitle || 'Apni Sawari Scheme',
        accountNumber: accountFormData.accountNumber || '0000000000',
        bankName: accountFormData.bankName || '',
        branchOrIban: accountFormData.branchOrIban || '',
        methodType: accountFormData.methodType || 'bank',
        instructions: accountFormData.instructions || '',
        isActive: accountFormData.isActive ?? true
      };
      onAddBankAccount(newAcc);
    }
    setShowAccountModal(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-16">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#181c1c] text-white p-4 rounded-3xl border border-[#fed488]/40 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl gold-gradient flex items-center justify-center text-[#261900] shadow-md shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#261900]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-black text-base text-white tracking-wide">
                {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'MASTER ADMIN PORTAL'}
              </h2>
              <span className="bg-[#fed488] text-[#261900] font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">
                {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'FULL ACCESS'}
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              {currentLang === 'sd'
                ? '          '
                : currentLang === 'ur'
                ? '          '
                : 'Full management of schemes, customers, payments, statements & draws'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onPreviewCustomerView && (
            <button
              id="btn-admin-preview-customer"
              onClick={onPreviewCustomerView}
              className="flex-1 sm:flex-none gold-gradient hover:opacity-95 text-[#785a1a] font-headline font-black text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-gold border border-[#e9c176] transition-all touch-target"
            >
              <Eye className="w-4 h-4 text-[#98001b]" />
              <span>{currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Customer View Preview'}</span>
            </button>
          )}

          {onLockAdmin && (
            <button
              id="btn-admin-lock"
              onClick={onLockAdmin}
              className="bg-[#98001b] hover:bg-[#be1e2d] text-white font-headline font-bold text-xs px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 cursor-pointer shadow-maroon transition-all touch-target"
            >
              <Lock className="w-4 h-4" />
              <span>{currentLang === 'sd' ? ' /  ' : currentLang === 'ur' ? ' /  ' : 'Lock / Exit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Pills - Fixed with shrink-0 and overflow scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 hide-scrollbar scrollbar-none">
        {[
          { id: 'ledger', label: currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Token Ledger', icon: FileSpreadsheet },
          { id: 'approvals', label: currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Approvals Queue', icon: ShieldCheck },
          { id: 'overview', label: currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Overview', icon: TrendingUp },
          { id: 'projects', label: currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Schemes & Cars', icon: Car },
          { id: 'users', label: currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Customers & Members', icon: Users },
          { id: 'payments', label: currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Payments & Slips', icon: CreditCard },
          { id: 'statements', label: currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Account Statements', icon: FileSpreadsheet },
          { id: 'winners', label: currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Winners', icon: Award },
          { id: 'accounts', label: currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Bank Accounts', icon: Building2 },
          { id: 'security', label: currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Admin PIN', icon: Lock },
          { id: 'terms', label: currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Terms & Conditions', icon: FileText }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`shrink-0 min-w-max flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-headline font-bold transition-all whitespace-nowrap cursor-pointer touch-target ${
                isActive
                  ? 'bg-[#98001b] text-white shadow-maroon scale-102 ring-1 ring-[#98001b]'
                  : 'bg-white dark:bg-[#2d3131] text-[#5b403f] dark:text-neutral-300 hover:bg-[#ebeeed] border border-[#e2e8f0] dark:border-neutral-700 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 0. APPROVALS TAB */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {activeSection === 'ledger' && (
        <AdminTokenLedgerSection
          activeProjects={activeProjects}
          users={users}
          projects={projects}
          payments={payments}
          onDeleteActiveProject={onDeleteActiveProject}
        />
      )}

      {activeSection === 'approvals' && (
        <AdminApprovalsSection
          users={users}
          activeProjects={activeProjects}
          projects={projects}
          onUpdateActiveProject={(updated) => { if (onUpdateActiveProject) onUpdateActiveProject(updated); 
            // we need this passed from App.tsx or we can just assume it's passed here
            // wait, AdminView doesn't have onUpdateActiveProject passed as a prop!
          }}
          onDeleteActiveProject={onDeleteActiveProject}
          onUpdateUser={(updated) => onUpdateUser && onUpdateUser(updated)}
          onDeleteUser={(userId) => onDeleteUser && onDeleteUser(userId)}
          currentLang={currentLang}
        />
      )}

      {/* 1. OVERVIEW TAB */}
      {/* ========================================================= */}
      {activeSection === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#f1e2e1] dark:border-neutral-700 card-shadow">
              <span className="text-[10px] text-[#5b403f] dark:text-neutral-400 font-bold uppercase block">
                {currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Total Verified Paid'}
              </span>
              <p className="font-headline font-black text-lg text-emerald-600 dark:text-emerald-400 mt-1">
                PKR {totalCollected.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500 font-semibold">
                {(payments || []).filter((p) => p.status === 'PAID').length} {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Successful slips'}
              </span>
            </div>

            <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#f1e2e1] dark:border-neutral-700 card-shadow">
              <span className="text-[10px] text-[#5b403f] dark:text-neutral-400 font-bold uppercase block">
                {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Pending Slips'}
              </span>
              <p className="font-headline font-black text-lg text-amber-600 dark:text-amber-400 mt-1">
                {pendingPayments.length} {currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Requests'}
              </p>
              <span className="text-[10px] text-neutral-500 font-semibold">
                {currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '  ' : 'Requires verification'}
              </span>
            </div>

            <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#f1e2e1] dark:border-neutral-700 card-shadow">
              <span className="text-[10px] text-[#5b403f] dark:text-neutral-400 font-bold uppercase block">
                {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Registered Members'}
              </span>
              <p className="font-headline font-black text-lg text-[#98001b] dark:text-[#ffb3b0] mt-1">
                {(users || []).length} {currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Users'}
              </p>
              <span className="text-[10px] text-neutral-500 font-semibold">
                {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '   ' : 'In cloud database'}
              </span>
            </div>

            <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#f1e2e1] dark:border-neutral-700 card-shadow">
              <span className="text-[10px] text-[#5b403f] dark:text-neutral-400 font-bold uppercase block">
                {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Active Schemes'}
              </span>
              <p className="font-headline font-black text-lg text-[#181c1c] dark:text-white mt-1">
                {(projects || []).length} {currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Schemes'}
              </p>
              <span className="text-[10px] text-neutral-500 font-semibold">
                {(winners || []).length} {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Lucky Draw winners'}
              </span>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-[#2d3131] p-5 rounded-3xl border border-[#f1e2e1] dark:border-neutral-700 card-shadow space-y-3">
            <h3 className="font-headline font-black text-xs text-[#181c1c] dark:text-white uppercase tracking-wider">
              {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Quick Admin Actions'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={handleOpenAddProject}
                className="bg-[#f8faf9] hover:bg-[#ffdad8]/30 dark:bg-neutral-800 p-3.5 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <Plus className="w-5 h-5 text-[#98001b]" />
                <span className="text-xs font-bold text-[#181c1c] dark:text-white">
                  {currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Add New Scheme'}
                </span>
              </button>

              <button
                onClick={handleOpenAddUser}
                className="bg-[#f8faf9] hover:bg-[#ffdad8]/30 dark:bg-neutral-800 p-3.5 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <UserPlus className="w-5 h-5 text-[#98001b]" />
                <span className="text-xs font-bold text-[#181c1c] dark:text-white">
                  {currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Add Member'}
                </span>
              </button>

              <button
                onClick={handleOpenAddPayment}
                className="bg-[#f8faf9] hover:bg-[#ffdad8]/30 dark:bg-neutral-800 p-3.5 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-[#181c1c] dark:text-white">
                  {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Manual Payment'}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('statements')}
                className="bg-[#f8faf9] hover:bg-[#ffdad8]/30 dark:bg-neutral-800 p-3.5 rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 flex flex-col items-center text-center gap-1.5 cursor-pointer transition-all active:scale-98"
              >
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-[#181c1c] dark:text-white">
                  {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Account Statements'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SCHEMES & PROJECTS MANAGEMENT */}
      {/* ========================================================= */}
      {activeSection === 'projects' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-xs text-[#181c1c] dark:text-white uppercase">
                {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'All Vehicle Schemes'} ({(projects || []).length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentLang === 'sd'
                  ? '           '
                  : currentLang === 'ur'
                  ? '          '
                  : 'Manage vehicle specs, monthly installments & images'}
              </p>
            </div>
            <button
              onClick={handleOpenAddProject}
              className="bg-[#98001b] hover:bg-[#be1e2d] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Add New Scheme'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {(projects || []).map((proj) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    className="w-20 h-20 rounded-xl object-cover border border-[#e0e3e2] shrink-0 bg-neutral-100"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white">
                        {proj.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fed488] text-[#261900]">
                        {proj.statusBadge}
                      </span>
                    </div>
                    <p className="text-xs text-[#5b403f] dark:text-neutral-300">
                      {proj.subtitle} &bull;{' '}
                      <strong className="text-[#98001b] dark:text-[#ffb3b0]">
                        PKR {proj.monthlyKist?.toLocaleString()}/mo
                      </strong>
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500">
                      Duration: {proj.durationMonths} Mo | Token: PKR {proj.tokenPrice?.toLocaleString()} | Seats:{' '}
                      {proj.totalMembers}
                    </p>
                    <p className="text-[10px] text-[#775a19] dark:text-[#fed488]">
                      {proj.nonWinnersRefundText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-700">
                  <button
                    onClick={() => handleOpenEditProject(proj)}
                    className="px-3 py-1.5 rounded-lg bg-[#f7faf9] hover:bg-[#ebeeed] dark:bg-neutral-800 text-[#181c1c] dark:text-white font-bold text-xs border border-[#e0e3e2] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#98001b]" />
                    <span>Edit</span>
                  </button>

                  {onDeleteProject && (
                    <button
                      onClick={() => setProjectToDelete(proj)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. REGISTERED CUSTOMERS & MEMBERS */}
      {/* ========================================================= */}
      {activeSection === 'users' && (
        <ErrorBoundary fallbackTitle="Customers & Members Directory">
          <AdminCustomersSection
            users={users}
            payments={payments}
            projects={projects}
            onAddUser={handleOpenAddUser}
            onEditUser={handleOpenEditUser}
            onDeleteUser={(userId) => onDeleteUser && onDeleteUser(userId)}
            onUpdateUser={(updated) => onUpdateUser && onUpdateUser(updated)}
            onViewSlip={(url, title) => {
              setViewingSlipUrl(url);
              setViewingSlipTitle(title);
            }}
          />
        </ErrorBoundary>
      )}

      {/* ========================================================= */}
      {/* 4. PAYMENTS & SLIPS APPROVAL */}
      {/* ========================================================= */}
      {activeSection === 'payments' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-xs text-[#181c1c] dark:text-white uppercase">
                {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Payment Submissions & Slips'} ({(payments || []).length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentLang === 'sd'
                  ? '       '
                  : currentLang === 'ur'
                  ? '        '
                  : 'Verify or reject deposit slips and manage transactions'}
              </p>
            </div>
            <button
              onClick={handleOpenAddPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Record Manual Payment'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(payments || []).map((payment) => (
              <div
                key={payment.id}
                className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-[#181c1c] dark:text-white">
                        {payment.projectName}
                      </h4>
                      {payment.userToken && (
                        <span className="text-[10px] font-mono font-bold bg-[#ffdad8] text-[#98001b] px-2 py-0.5 rounded-md">
                          Token: {payment.userToken}
                        </span>
                      )}
                      {payment.userName && (
                        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                          ({payment.userName})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5b403f] dark:text-neutral-400 mt-0.5">
                      {payment.installmentLabel} &bull; Method:{' '}
                      <strong className="text-[#181c1c] dark:text-white">{payment.paymentMethod}</strong>
                    </p>
                    <p className="text-[10px] font-mono text-[#775a19] dark:text-[#fed488]">
                      Ref: {payment.transactionRef} &bull; Date: {payment.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="font-black text-sm text-[#98001b] dark:text-[#ffb3b0]">
                        PKR {payment.amount.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          payment.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payment.status === 'UNDER_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {payment.receiptUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingSlipUrl(payment.receiptUrl || null);
                            setViewingSlipTitle(
                              `${payment.userName || 'Member'} - ${payment.projectName} (${payment.transactionRef})`
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1 cursor-pointer"
                          title="View Payment Screenshot / Slip"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'View Slip'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditPayment(payment)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f7faf9] hover:bg-[#ebeeed] dark:bg-neutral-800 text-[#181c1c] dark:text-white font-bold text-xs border border-[#e0e3e2] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#98001b]" />
                        <span>{currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Edit'}</span>
                      </button>

                      {onDeletePayment && (
                        <button
                          onClick={() => setPaymentToDelete(payment)}
                          className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-1 cursor-pointer"
                          title="Delete False / Invalid Receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {payment.rejectReason && (
                  <p className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                    {currentLang === 'sd' ? '   : ' : currentLang === 'ur' ? '   : ' : 'Rejection Reason: '}
                    {payment.rejectReason}
                  </p>
                )}

                {payment.status === 'UNDER_REVIEW' && (
                  <div className="flex gap-2 pt-2 border-t border-[#e0e3e2] dark:border-neutral-700">
                    <button
                      onClick={() => onApprovePayment(payment.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Approve & Verify'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectingPayment(payment);
                        setRejectionReasonInput('Invalid receipt / mismatched TRX ID');
                      }}
                      className="px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Reject'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ACCOUNT STATEMENTS */}
      {/* ========================================================= */}
      {activeSection === 'statements' && (
        <ErrorBoundary fallbackTitle="Account Financial Statements">
          <AdminStatementsSection
            payments={payments}
            bankAccounts={bankAccounts}
            users={users}
            projects={projects}
            onViewSlip={(url, title) => {
              setViewingSlipUrl(url);
              setViewingSlipTitle(title);
            }}
          />
        </ErrorBoundary>
      )}

      {/* ========================================================= */}
      {/* 6. WINNERS LIST & LIVE BALLOTING SIMULATOR */}
      {/* ========================================================= */}
      {activeSection === 'winners' && (
        <div className="space-y-4">
          {/* Live Draw Simulator Hero Card for Admin */}
          <div className="bg-gradient-to-r from-[#181c1c] via-[#25201a] to-[#181c1c] p-4 sm:p-5 rounded-3xl border-2 border-[#fed488]/70 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 gold-gradient rounded-full opacity-10 blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-3.5 z-10">
              <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center text-[#261900] shadow-gold shrink-0 border border-[#e9c176]">
                <Sparkles className="w-6 h-6 text-[#98001b]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 bg-[#fed488] text-[#261900] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono mb-1">
                  LIVE DIGITAL BALLOTING
                </div>
                <h3 className="font-headline font-black text-base sm:text-lg text-white">
                  {currentLang === 'sd' ? '    ' : currentLang === 'ur' ? '    ' : 'Digital Lucky Draw Balloting'}
                </h3>
                <p className="text-xs text-[#fed488] mt-0.5">
                  {currentLang === 'sd'
                    ? '       •            '
                    : currentLang === 'ur'
                    ? '          •       '
                    : 'Auto-loads all registered members & tokens. Run ballot simulation & broadcast live to portal!'}
                </p>
              </div>
            </div>

            <button
              id="btn-admin-run-live-ballot"
              onClick={() => setShowLiveBallotModal(true)}
              className="w-full sm:w-auto gold-gradient text-[#261900] font-headline font-black text-xs px-5 py-3 rounded-full shadow-gold hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#e9c176] whitespace-nowrap z-10"
            >
              <Play className="w-4 h-4 fill-current text-[#98001b]" />
              <span>{currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '   (Simulate Draw)' : 'Run Live Balloting Draw'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <h3 className="font-headline font-bold text-xs text-[#181c1c] dark:text-white uppercase">
                {currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '    ' : 'Official Draw Winners'} ({(winners || []).length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentLang === 'sd'
                  ? '       '
                  : currentLang === 'ur'
                  ? '       '
                  : 'Manage lucky draw winner announcements and history'}
              </p>
            </div>
            <button
              onClick={handleOpenAddWinner}
              className="bg-white dark:bg-neutral-800 text-[#181c1c] dark:text-white border border-[#e0e3e2] dark:border-neutral-700 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-[#f7faf9]"
            >
              <Plus className="w-4 h-4 text-[#98001b]" />
              <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Manual Add'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(winners || []).map((win) => (
              <div
                key={win.id}
                className="bg-white dark:bg-[#2d3131] p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-[#261900] font-bold shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#181c1c] dark:text-white">{win.name}</h4>
                    <p className="text-[11px] text-[#5b403f] dark:text-neutral-400">
                      {currentLang === 'sd' ? ': ' : currentLang === 'ur' ? ': ' : 'Prize: '}
                      <strong className="text-[#98001b] dark:text-[#ffb3b0]">{win.prizeWon}</strong>
                    </p>
                    <p className="text-[10px] font-mono text-[#775a19] dark:text-[#fed488]">
                      Token: {win.memberId} &bull; {win.date} &bull; Ticket: {win.ticketNumber || 'TKT-01'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditWinner(win)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#f7faf9] hover:bg-[#ebeeed] dark:bg-neutral-800 text-[#181c1c] dark:text-white font-bold text-xs border border-[#e0e3e2] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#98001b]" />
                    <span>{currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Edit'}</span>
                  </button>

                  {onDeleteWinner && (
                    <button
                      onClick={() => setWinnerToDelete(win)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. BANK ACCOUNTS & WALLETS */}
      {/* ========================================================= */}
      {activeSection === 'accounts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline font-bold text-xs text-[#181c1c] dark:text-white uppercase">
                {currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'Payment Collection Accounts'} ({(bankAccounts || []).length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentLang === 'sd'
                  ? '        '
                  : currentLang === 'ur'
                  ? '          '
                  : 'Manage JazzCash, EasyPaisa and Bank accounts'}
              </p>
            </div>
            <button
              onClick={handleOpenAddAccount}
              className="bg-[#98001b] hover:bg-[#be1e2d] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Add Account'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {(bankAccounts || []).map((account) => (
              <div
                key={account.id}
                className={`bg-white dark:bg-[#2d3131] p-4 rounded-2xl border shadow-xs transition-all ${
                  account.isActive
                    ? 'border-[#e0e3e2] dark:border-neutral-700'
                    : 'border-dashed border-red-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#fed488]/30 flex items-center justify-center text-[#98001b] shrink-0 mt-0.5">
                      {account.methodType === 'easypaisa' && <Smartphone className="w-5 h-5 text-emerald-600" />}
                      {account.methodType === 'jazzcash' && <Smartphone className="w-5 h-5 text-red-600" />}
                      {account.methodType === 'bank' && <Building2 className="w-5 h-5 text-blue-600" />}
                      {account.methodType === 'cash' && <Banknote className="w-5 h-5 text-[#775a19]" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#181c1c] dark:text-white">
                          {account.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            account.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}
                        >
                          {account.isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>

                      <p className="text-xs text-[#5b403f] dark:text-neutral-300">
                        {currentLang === 'sd' ? '  : ' : currentLang === 'ur' ? '  : ' : 'Account Title: '}
                        <strong className="text-[#181c1c] dark:text-white">{account.accountTitle}</strong>
                      </p>

                      <p className="font-mono text-sm font-bold text-[#98001b] dark:text-[#ffb3b0]">
                        {account.accountNumber}
                      </p>

                      {account.bankName && (
                        <p className="text-[11px] text-[#775a19] dark:text-[#fed488]">
                          {account.bankName} {account.branchOrIban ? `| IBAN: ${account.branchOrIban}` : ''}
                        </p>
                      )}

                      {account.instructions && (
                        <p className="text-[11px] text-[#5b403f] dark:text-neutral-400 bg-[#f7faf9] dark:bg-neutral-800 p-2 rounded-lg mt-1 border border-[#e0e3e2] dark:border-neutral-700">
                          ℹ️ {account.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditAccount(account)}
                      className="px-3 py-1.5 rounded-lg bg-[#f7faf9] hover:bg-[#ebeeed] dark:bg-neutral-800 text-[#181c1c] dark:text-white font-bold text-xs border border-[#e0e3e2] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#98001b]" />
                      <span>{currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Edit'}</span>
                    </button>

                    <button
                      onClick={() => setAccountToDelete(account)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{currentLang === 'sd' ? '' : currentLang === 'ur' ? '' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MASTER PIN & SECURITY SETTINGS */}
      {/* ========================================================= */}
      {activeSection === 'security' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#2d3131] p-5 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#98001b]/10 dark:bg-[#98001b]/30 flex items-center justify-center text-[#98001b]">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline font-black text-sm text-[#181c1c] dark:text-white uppercase">
                  {currentLang === 'sd' ? '    ' : currentLang === 'ur' ? '    ' : 'Master Admin PIN & Security Settings'}
                </h3>
                <p className="text-xs text-[#5b403f] dark:text-neutral-400 mt-0.5">
                  {currentLang === 'sd'
                    ? '       '
                    : currentLang === 'ur'
                    ? '      (Master PIN)        '
                    : 'Change your secret Master PIN to secure the administrator portal'}
                </p>
              </div>
            </div>

            {pinChangeSaved && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl flex items-center gap-2 text-xs font-bold font-urdu">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>          (New Admin PIN updated and saved successfully)!</span>
              </div>
            )}

            {pinChangeError && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-3 rounded-xl flex items-center gap-2 text-xs font-bold font-urdu">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{pinChangeError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPinChangeError('');
                setPinChangeSaved(false);

                if (!newPinInput.trim() || newPinInput.trim().length < 4) {
                  setPinChangeError('      4     (PIN must be at least 4 chars).');
                  return;
                }

                if (newPinInput !== confirmPinInput) {
                  setPinChangeError('            (PINs do not match).');
                  return;
                }

                if (onUpdateAdminPin) {
                  try {
                    await onUpdateAdminPin(newPinInput.trim());
                    setPinChangeSaved(true);
                    setNewPinInput('');
                    setConfirmPinInput('');
                    setTimeout(() => setPinChangeSaved(false), 4000);
                  } catch {
                    setPinChangeError('           ');
                  }
                }
              }}
              className="space-y-4 pt-2 border-t border-[#e0e3e2] dark:border-neutral-700"
            >
              <div>
                <label className="block text-xs font-bold text-[#181c1c] dark:text-white uppercase mb-1">
                  New Master Secret PIN
                </label>
                <div className="relative max-w-md">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Enter new Master PIN (••••)"
                    className="w-full pl-3 pr-10 py-2.5 bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl font-mono font-bold text-sm text-[#181c1c] dark:text-white focus:border-[#98001b] outline-none"
                    required
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-[#8f6f6e] hover:text-[#181c1c] cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#181c1c] dark:text-white uppercase mb-1">
                  {currentLang === 'sd' ? '    ' : currentLang === 'ur' ? '    ' : 'Confirm New Master PIN'}
                </label>
                <div className="relative max-w-md">
                  <input
                    type="password"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-3 pr-4 py-2.5 bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl font-mono font-bold text-sm text-[#181c1c] dark:text-white focus:border-[#98001b] outline-none"
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#98001b] hover:bg-[#be1e2d] text-white font-headline font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Save New Admin PIN'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. TERMS & CONDITIONS */}
      {/* ========================================================= */}
      {activeSection === 'terms' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-xs text-[#181c1c] dark:text-white uppercase">
                {currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '  ' : 'Terms & Conditions Rules'} ({(terms || []).length})
              </h3>
              <p className="text-[11px] text-neutral-500">
                {currentLang === 'sd'
                  ? '       '
                  : currentLang === 'ur'
                  ? '         '
                  : 'Manage legal terms, clauses and policy agreements'}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTermIndex(null);
                setTermFormData({
                  number: `${(terms || []).length + 1}`,
                  title: currentLang === 'sd' ? ' ' : currentLang === 'ur' ? ' ' : 'New Clause',
                  paragraphsText: currentLang === 'sd' ? '  ' : currentLang === 'ur' ? '     ' : 'Enter clause details here.'
                });
                setShowTermModal(true);
              }}
              className="bg-[#98001b] hover:bg-[#be1e2d] text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '   ' : 'Add New Clause'}</span>
            </button>
            <button
              onClick={() => {
                if (onUpdateTerms && window.confirm('Are you sure you want to restore the original Urdu terms? This will overwrite the current terms.')) {
                  onUpdateTerms(EXACT_TERMS_SECTIONS);
                }
              }}
              className="bg-neutral-800 hover:bg-neutral-900 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm ml-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Original</span>
            </button>
          </div>

          <div className="space-y-3">
            {(terms || []).map((t, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-2"
              >
                <div className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#fed488]/40 text-[#775a19]">
                      #{t.number}
                    </span>
                    <h4 className="font-bold text-sm text-[#181c1c] dark:text-white font-urdu">
                      {t.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTermIndex(idx);
                      setTermFormData({
                        number: t.number,
                        title: t.title,
                        paragraphsText: (t.paragraphs || []).join('\n\n')
                      });
                      setShowTermModal(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#f7faf9] dark:bg-neutral-800 text-xs font-bold border flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#98001b]" />
                    <span>Edit Clause</span>
                  </button>
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-300 font-urdu leading-relaxed space-y-1">
                  {(t.paragraphs || []).map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT SCHEME MODAL (100% FULLY EDITABLE FROM A TO Z) */}
      {/* ========================================================= */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#e0e3e2] dark:border-neutral-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ffdad8] text-[#98001b] flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase tracking-wide">
                    {editingProject ? 'Edit Scheme & Vehicle' : 'Add New Scheme & Vehicle'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-urdu">
                                
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectSubmit} className="space-y-4 text-xs">
              {/* Section 1: Basic Identity */}
              <div className="bg-[#f7faf9] dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-3">
                <span className="font-['Montserrat'] font-bold text-[11px] uppercase tracking-wider text-[#98001b] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  1. Scheme Identity & Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Scheme Title *
                    </label>
                    <input
                      type="text"
                      value={projectFormData.title || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      placeholder="e.g. HONDA CD 70cc (2026)"
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={projectFormData.startDate || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Duration (Months / ) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={projectFormData.durationMonths || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, durationMonths: Number(e.target.value) })}
                      placeholder="e.g. 36"
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Status Badge
                    </label>
                    <select
                      value={projectFormData.statusBadge || 'Booking Open'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, statusBadge: e.target.value })}
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-semibold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    >
                      <option value="Booking Open">Booking Open</option>
                      <option value="Few Left">Few Left</option>
                      <option value="Limited Seats">Limited Seats</option>
                      <option value="Closing Soon">Closing Soon</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Total Seats / Members
                    </label>
                    <input
                      type="number"
                      value={projectFormData.totalMembers || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, totalMembers: Number(e.target.value) })}
                      placeholder="e.g. 450"
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Installments */}
              <div className="bg-[#f7faf9] dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-3">
                <span className="font-['Montserrat'] font-bold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  2. Pricing
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Monthly Kist (PKR)
                    </label>
                    <input
                      type="number"
                      value={projectFormData.monthlyKist || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, monthlyKist: Number(e.target.value) })}
                      placeholder="5000"
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-[#98001b]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                      Token Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={projectFormData.tokenPrice || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, tokenPrice: Number(e.target.value) })}
                      placeholder="5000"
                      className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 font-bold text-[#98001b] dark:text-[#ffb3b0] outline-none focus:border-[#98001b]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Picture & Photo Upload */}
              <div className="bg-[#f7faf9] dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-3">
                <span className="font-['Montserrat'] font-bold text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  3. Scheme Picture & Photo
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-[#e0e3e2] dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center relative">
                    {projectFormData.imageUrl ? (
                      <img src={projectFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 text-neutral-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-[9px]">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div>
                      <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                        Image Web URL
                      </label>
                      <input
                        type="text"
                        value={projectFormData.imageUrl || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="file" ref={projectFileInputRef} accept="image/*" onChange={handleProjectImageUpload} className="hidden" />
                      <button type="button" onClick={() => projectFileInputRef.current?.click()} disabled={isProjectImageCompressing} className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 text-[#181c1c] dark:text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-[#e0e3e2] dark:border-neutral-600 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#98001b]" />
                        <span>Upload Photo from Device</span>
                      </button>
                      {projectFormData.imageUrl && (
                        <button type="button" onClick={() => setProjectFormData({ ...projectFormData, imageUrl: '' })} className="text-red-600 hover:text-red-700 text-xs font-bold px-2 py-1 cursor-pointer">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Full Description */}
              <div className="bg-[#f7faf9] dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-3">
                <span className="font-['Montserrat'] font-bold text-[11px] uppercase tracking-wider text-[#775a19] dark:text-[#fed488] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  4. Full Description
                </span>
                <div>
                  <textarea
                    rows={3}
                    value={projectFormData.description || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    placeholder="     ..."
                    className="w-full bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl p-3 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-[#e0e3e2] dark:border-neutral-700">
                <button type="button" onClick={() => setShowProjectModal(false)} className="flex-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-neutral-700 dark:text-white py-3 rounded-2xl font-bold cursor-pointer transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isProjectImageCompressing} className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white py-3 rounded-2xl font-bold cursor-pointer shadow-lg transition-all">
                  {editingProject ? 'Save All Scheme Changes' : 'Create & Publish Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT USER MODAL */}
      {/* ========================================================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                {editingUser ? 'Edit Member Profile' : 'Add New Member'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userFormData.name || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Muhammad Usman"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={userFormData.phone || userFormData.phoneNumber || ''}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        phone: e.target.value,
                        phoneNumber: e.target.value
                      })
                    }
                    placeholder="03001234567"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    CNIC
                  </label>
                  <input
                    type="text"
                    value={userFormData.cnic || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, cnic: e.target.value })}
                    placeholder="41302-1234567-1"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={userFormData.password || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="user123"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Account Status
                  </label>
                  <select
                    value={userFormData.account_status || 'active'}
                    onChange={(e) => setUserFormData({ ...userFormData, account_status: e.target.value as any })}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  >
                    <option value="active">Active</option>
                    <option value="frozen">Frozen</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={userFormData.address || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                  placeholder="House 12, Latifabad, Hyderabad"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-white py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {editingUser ? 'Save Member' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD / EDIT PAYMENT MODAL (Record Manual Payment) */}
      {/* ========================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                {editingPayment ? 'Edit Payment Record' : 'Record Manual Payment'}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePaymentSubmit} className="space-y-3 text-xs">
              {/* Member Search: Auto-fills Details */}
              <div className="relative">
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Search Registered Member
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by Name, CNIC, or Mobile..."
                    value={memberSearchQuery}
                    onChange={(e) => {
                      setMemberSearchQuery(e.target.value);
                      setShowMemberDropdown(true);
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl pl-9 pr-3 py-2.5 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  />
                </div>
                {showMemberDropdown && memberSearchQuery && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {(activeProjects || []).filter(act => {
                      const q = memberSearchQuery.toLowerCase();
                      const matchedUser = (users || []).find(u => u.id === act.userId || u.uid === act.userId);
                      return (
                        act.ticketNumber?.toLowerCase().includes(q) || 
                        act.userName?.toLowerCase().includes(q) || 
                        act.projectTitle?.toLowerCase().includes(q) ||
                        matchedUser?.cnic?.includes(q) || 
                        matchedUser?.phone?.includes(q) || 
                        matchedUser?.phoneNumber?.includes(q)
                      );
                    }).map(act => {
                      const matchedUser = (users || []).find(u => u.id === act.userId || u.uid === act.userId);
                      return (
                      <div
                        key={act.id}
                        className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer border-b last:border-0 border-neutral-100 dark:border-neutral-700"
                        onClick={() => {
                          setPaymentFormData({
                            ...paymentFormData,
                            userToken: act.ticketNumber || '',
                            userName: act.userName || matchedUser?.name || '',
                            userId: act.userId || '',
                            projectName: act.projectTitle,
                            amount: act.monthlyKist || act.tokenAmount || 5000
                          });
                          setMemberSearchQuery(`${act.ticketNumber} - ${act.userName}`);
                          setShowMemberDropdown(false);
                        }}
                      >
                        <div className="font-bold text-sm text-[#181c1c] dark:text-white">
                          Token: {act.ticketNumber} | {act.userName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Scheme: {act.projectTitle} {matchedUser ? `| CNIC: ${matchedUser.cnic} | 📞 ${matchedUser.phone || matchedUser.phoneNumber}` : ''}
                        </div>
                      </div>
                    )})}
                    {(users || []).filter(u => {
                      const q = memberSearchQuery.toLowerCase();
                      return (u.name?.toLowerCase().includes(q) || u.cnic?.includes(q) || u.phone?.includes(q) || u.phoneNumber?.includes(q));
                    }).map(u => {
                      if ((activeProjects || []).some(act => act.userId === (u.id || u.uid))) return null;
                      return (
                      <div
                        key={u.id}
                        className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer border-b last:border-0 border-neutral-100 dark:border-neutral-700"
                        onClick={() => {
                          setPaymentFormData({
                            ...paymentFormData,
                            userToken: u.memberId || '',
                            userName: u.name || '',
                            userId: u.id || u.uid || '',
                          });
                          setMemberSearchQuery(u.name + " - " + (u.cnic || u.phone));
                          setShowMemberDropdown(false);
                        }}
                      >
                        <div className="font-bold text-sm text-[#181c1c] dark:text-white">{u.name} (No Active Scheme)</div>
                        <div className="text-xs text-neutral-500">CNIC: {u.cnic} | 📞 {u.phone || u.phoneNumber}</div>
                      </div>
                    )})}
                    {(users || []).filter(u => {
                      const q = memberSearchQuery.toLowerCase();
                      return (u.name?.toLowerCase().includes(q) || u.cnic?.includes(q) || u.phone?.includes(q) || u.phoneNumber?.includes(q));
                    }).length === 0 && (
                      <div className="p-3 text-sm text-neutral-500 text-center">No member found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Token ID
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.userToken || ''}
                    readOnly
                    placeholder="Auto-filled"
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 font-mono font-bold text-neutral-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.userName || ''}
                    readOnly
                    placeholder="Auto-filled"
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 font-bold text-neutral-500 outline-none"
                  />
                </div>
              </div>

              {/* Scheme Selection: Auto-fills Monthly Kist Amount */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Scheme / Plan
                </label>
                <select
                  value={paymentFormData.projectName || ''}
                  onChange={(e) => {
                    const selTitle = e.target.value;
                    const matchedProj = (projects || []).find((p) => p.title === selTitle);
                    setPaymentFormData({
                      ...paymentFormData,
                      projectName: selTitle,
                      amount: matchedProj
                        ? matchedProj.monthlyKist || matchedProj.tokenPrice || paymentFormData.amount
                        : paymentFormData.amount
                    });
                  }}
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  required
                >
                  {(projects || []).map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title} (Kist: PKR {p.monthlyKist?.toLocaleString() || p.tokenPrice?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Amount Paid (PKR)
                  </label>
                  <input
                    type="number"
                    value={paymentFormData.amount || ''}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: Number(e.target.value) })}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-[#98001b]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Installment Label
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.installmentLabel || ''}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, installmentLabel: e.target.value })}
                    placeholder="e.g. Month 1 / Kist 2"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
              </div>

              {/* Receiving Account Selection */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Receiving Bank / Channel
                </label>
                <select
                  value={paymentFormData.paymentMethod || ''}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  required
                >
                  {(bankAccounts || []).map((acc) => (
                    <option key={acc.id} value={`${acc.title} (${acc.accountNumber})`}>
                      {acc.title} - {acc.accountNumber} ({acc.accountTitle})
                    </option>
                  ))}
                  <option value="Head Office Cash Counter">Head Office Cash Counter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Transaction / Trx Ref
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.transactionRef || ''}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, transactionRef: e.target.value })}
                    placeholder="TRX-123456"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={paymentFormData.status || 'PAID'}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, status: e.target.value as any })}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  >
                    <option value="PAID">PAID</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-white py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {editingPayment ? 'Save Payment' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD / EDIT WINNER MODAL */}
      {/* ========================================================= */}
      {showWinnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                {editingWinner ? 'Edit Winner Record' : 'Add Lucky Draw Winner'}
              </h3>
              <button
                onClick={() => setShowWinnerModal(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWinnerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Winner Name
                </label>
                <input
                  type="text"
                  value={winnerFormData.name || ''}
                  onChange={(e) => setWinnerFormData({ ...winnerFormData, name: e.target.value })}
                  placeholder="e.g. Asad Ali"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Token ID
                  </label>
                  <input
                    type="text"
                    value={winnerFormData.memberId || ''}
                    onChange={(e) => setWinnerFormData({ ...winnerFormData, memberId: e.target.value })}
                    placeholder="TK-2026-001"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={winnerFormData.city || ''}
                    onChange={(e) => setWinnerFormData({ ...winnerFormData, city: e.target.value })}
                    placeholder="Hyderabad"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Prize Won
                </label>
                <input
                  type="text"
                  value={winnerFormData.prizeWon || ''}
                  onChange={(e) => setWinnerFormData({ ...winnerFormData, prizeWon: e.target.value })}
                  placeholder="HONDA CD 70cc (2026)"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={winnerFormData.photoUrl || ''}
                  onChange={(e) => setWinnerFormData({ ...winnerFormData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWinnerModal(false)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-white py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 gold-gradient text-[#261900] py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {editingWinner ? 'Save Winner' : 'Add Winner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD / EDIT BANK ACCOUNT MODAL */}
      {/* ========================================================= */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                {editingAccount ? 'Edit Bank Account' : 'Add Collection Account'}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Display Title
                </label>
                <input
                  type="text"
                  value={accountFormData.title || ''}
                  onChange={(e) => setAccountFormData({ ...accountFormData, title: e.target.value })}
                  placeholder="e.g. Meezan Bank / JazzCash"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={accountFormData.accountTitle || ''}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountTitle: e.target.value })}
                    placeholder="Apni Sawari Scheme"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Account Number / IBAN
                  </label>
                  <input
                    type="text"
                    value={accountFormData.accountNumber || ''}
                    onChange={(e) => setAccountFormData({ ...accountFormData, accountNumber: e.target.value })}
                    placeholder="03001234567 or 0201..."
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Channel Type
                  </label>
                  <select
                    value={accountFormData.methodType || 'bank'}
                    onChange={(e) => setAccountFormData({ ...accountFormData, methodType: e.target.value as any })}
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="cash">Cash Counter</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={accountFormData.bankName || ''}
                    onChange={(e) => setAccountFormData({ ...accountFormData, bankName: e.target.value })}
                    placeholder="Meezan Bank Ltd"
                    className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Payment Instructions
                </label>
                <textarea
                  value={accountFormData.instructions || ''}
                  onChange={(e) => setAccountFormData({ ...accountFormData, instructions: e.target.value })}
                  placeholder="Transfer payment and keep screenshot..."
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 text-neutral-800 dark:text-white outline-none focus:border-[#98001b] h-16 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-white py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  {editingAccount ? 'Save Account' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: EDIT TERMS CLAUSE MODAL */}
      {/* ========================================================= */}
      {showTermModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                {editingTermIndex !== null ? 'Edit Term Clause' : 'Add New Clause'}
              </h3>
              <button
                onClick={() => setShowTermModal(false)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const paragraphs = termFormData.paragraphsText
                  .split('\n\n')
                  .map((p) => p.trim())
                  .filter(Boolean);

                const updatedTerms = [...terms];
                if (editingTermIndex !== null) {
                  updatedTerms[editingTermIndex] = {
                    number: termFormData.number,
                    title: termFormData.title,
                    paragraphs
                  };
                } else {
                  updatedTerms.push({
                    number: termFormData.number,
                    title: termFormData.title,
                    paragraphs
                  });
                }
                if (onUpdateTerms) onUpdateTerms(updatedTerms);
                setShowTermModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Clause Number
                </label>
                <input
                  type="text"
                  value={termFormData.number}
                  onChange={(e) => setTermFormData({ ...termFormData, number: e.target.value })}
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-mono font-bold text-neutral-800 dark:text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Clause Title
                </label>
                <input
                  type="text"
                  value={termFormData.title}
                  onChange={(e) => setTermFormData({ ...termFormData, title: e.target.value })}
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-urdu font-bold text-neutral-800 dark:text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  Paragraphs
                </label>
                <textarea
                  value={termFormData.paragraphsText}
                  onChange={(e) => setTermFormData({ ...termFormData, paragraphsText: e.target.value })}
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border rounded-xl px-3 py-2 font-urdu text-neutral-800 dark:text-white outline-none h-40 resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTermModal(false)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-white py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Clause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: VIEW PAYMENT SLIP SCREENSHOT */}
      {/* ========================================================= */}
      {viewingSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingSlipUrl(null)}
        >
          <div
            className="bg-white dark:bg-[#1e2323] max-w-lg w-full rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-['Montserrat'] font-bold text-xs text-neutral-700 dark:text-neutral-300">
                {viewingSlipTitle || 'Payment Slip'}
              </span>
              <button
                onClick={() => setViewingSlipUrl(null)}
                className="text-neutral-400 hover:text-neutral-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <img
                src={viewingSlipUrl}
                alt="Payment Slip Screenshot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: DELETE PAYMENT CONFIRMATION (Fixes Delete Button) */}
      {/* ========================================================= */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Delete Payment Record?
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                     (Ref: <strong className="font-mono">{paymentToDelete.transactionRef}</strong> &bull; PKR {paymentToDelete.amount.toLocaleString()})                      
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePayment) {
                    onDeletePayment(paymentToDelete.id);
                  }
                  setPaymentToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 9: DELETE PROJECT CONFIRMATION */}
      {/* ========================================================= */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Delete Scheme?
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                    <strong>{projectToDelete.title}</strong>    
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProject) onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Delete Scheme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 10: DELETE WINNER CONFIRMATION */}
      {/* ========================================================= */}
      {winnerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Delete Winner Record?
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                    <strong>{winnerToDelete.name}</strong> ({winnerToDelete.prizeWon})      
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWinnerToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteWinner) onDeleteWinner(winnerToDelete.id);
                  setWinnerToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Delete Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 11: DELETE ACCOUNT CONFIRMATION */}
      {/* ========================================================= */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Delete Bank Account?
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                   <strong>{accountToDelete.title}</strong> ({accountToDelete.accountNumber})    
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteBankAccount) onDeleteBankAccount(accountToDelete.id);
                  setAccountToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 12: PAYMENT REJECTION REASON DIALOG */}
      {/* ========================================================= */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Reject Payment Submission
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                              
              </p>
              <p className="text-[11px] font-mono text-[#98001b] font-bold">
                {rejectingPayment.userName} - PKR {rejectingPayment.amount.toLocaleString()} ({rejectingPayment.transactionRef})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Rejection Reason
              </label>
              <input
                type="text"
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Invalid receipt / Unverified transaction"
                className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-red-600"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRejectPayment(rejectingPayment.id, rejectionReasonInput.trim() || 'Invalid receipt');
                  setRejectingPayment(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 13: ADMIN LIVE BALLOT SIMULATOR MODAL */}
      {/* ========================================================= */}
      <AdminLiveDrawModal
        isOpen={showLiveBallotModal}
        onClose={() => setShowLiveBallotModal(false)}
        users={users}
        activeProjects={activeProjects}
        payments={payments}
        projects={projects}
        onAddWinner={onAddWinner}
        currentLang={currentLang}
      />
    </div>
  );
};

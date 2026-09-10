import React, { useState, useEffect, useMemo } from 'react';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DrawerMenu } from './components/DrawerMenu';
import { BrochureModal } from './components/BrochureModal';
import { PaymentModal } from './components/PaymentModal';
import { JoinProjectModal } from './components/JoinProjectModal';
import { NotificationModal } from './components/NotificationModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallAppBanner } from './components/InstallAppBanner';
import { NetworkStatusIndicator } from './components/NetworkStatusIndicator';

import { HomeView } from './views/HomeView';

import { ProjectDetailView } from './views/ProjectDetailView';
import { DashboardView } from './views/DashboardView';
import { PaymentsView } from './views/PaymentsView';
import { LuckyDrawView } from './views/LuckyDrawView';
import { ProfileView } from './views/ProfileView';
import { TermsView } from './views/TermsView';
import { AuthView } from './views/AuthView';
import { AdminView } from './views/AdminView';

import {
  INITIAL_USER
} from './data/mockData';
import {
  TabType,
  VehicleProject,
  PaymentRecord,
  UserProfile,
  UserActiveProject,
  RegistrationFormData,
  WinnerRecord,
  BankAccountDetail,
  TermSection
} from './types';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  LanguageType,
  LANGUAGES,
  getSavedLanguage,
  saveLanguage
} from './lib/translations';
import {
  testFirestoreConnection,
  subscribeToUsers,
  saveUserToFirestore,
  deleteUserFromFirestore,
  subscribeToActiveProjects,
  saveActiveProjectToFirestore,
  deleteActiveProjectFromFirestore,
  subscribeToPayments,
  savePaymentToFirestore,
  deletePaymentFromFirestore,
  subscribeToBankAccounts,
  saveBankAccountToFirestore,
  deleteBankAccountFromFirestore,
  subscribeToTerms,
  saveAllTermsToFirestore,
  subscribeToWinners,
  saveWinnerToFirestore,
  deleteWinnerFromFirestore,
  subscribeToProjects,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  subscribeToAppConfig
} from './lib/firestoreService';
import {
  validateAdminSessionWithServer,
  logoutAdminWithServer,
  changeAdminPinWithServer,
  generatePaymentIdempotencyKey
} from './lib/security';
import { getNextUniqueTokenNumber } from './lib/tokenService';
import {
  getStoredAdminToken,
  setStoredAdminToken,
  clearStoredAdminToken,
  getStoredSessionUser,
  setStoredSessionUser,
  removeStoredSessionUser,
  getStoredRegisteredUsers,
  setStoredRegisteredUsers,
  getStoredActiveProjects,
  setStoredActiveProjects,
  getStoredPayments,
  setStoredPayments,
  getStoredProjects,
  setStoredProjects,
  getStoredWinners,
  setStoredWinners,
  getStoredBankAccounts,
  setStoredBankAccounts,
  getStoredTerms,
  setStoredTerms,
  clearAllResetData
} from './lib/storageService';

export function App() {
  // 1. Session & Auth State: 'none' | 'customer' | 'admin'
  const [adminToken, setAdminToken] = useState<string | null>(() => getStoredAdminToken());

  const [authRole, setAuthRole] = useState<'none' | 'customer' | 'admin'>(() => {
    const savedAdminToken = getStoredAdminToken();
    if (savedAdminToken) return 'admin';
    const savedUser = getStoredSessionUser();
    if (savedUser) return 'customer';
    return 'none';
  });

  // Server session validation for admin with proper cleanup
  useEffect(() => {
    let isMounted = true;

    if (adminToken) {
      validateAdminSessionWithServer(adminToken).then((res) => {
        if (!isMounted) return;
        if (!res.valid) {
          setAdminToken(null);
          clearStoredAdminToken();
          if (authRole === 'admin') {
            setAuthRole('none');
            setCurrentTab('auth');
          }
        }
      });
    } else if (authRole === 'admin') {
      // Must not allow admin state without active server session token
      setAuthRole('none');
      setCurrentTab('auth');
    }

    return () => {
      isMounted = false;
    };
  }, [adminToken, authRole]);

  // Current active customer user profile
  const [user, setUser] = useState<UserProfile | null>(() => getStoredSessionUser());

  // Terms and Conditions State (Admin editable)
  const [termsList, setTermsList] = useState<TermSection[]>(() => getStoredTerms());

  // Registered Users list (Synced live with Firestore cloud)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => getStoredRegisteredUsers());

  // Active Projects of current user
  const [activeProjects, setActiveProjects] = useState<UserActiveProject[]>(() => getStoredActiveProjects());

  // Payment Records ledger
  const [payments, setPayments] = useState<PaymentRecord[]>(() => getStoredPayments());

  // Vehicle schemes / catalog
  const [allProjects, setAllProjects] = useState<VehicleProject[]>(() => getStoredProjects());

  // Winners list
  const [winners, setWinners] = useState<WinnerRecord[]>(() => getStoredWinners());

  // Bank Accounts / Payment channels
  const [bankAccounts, setBankAccounts] = useState<BankAccountDetail[]>(() => getStoredBankAccounts());

  // Language State: 'en' | 'ur' | 'sd'
  const [lang, setLang] = useState<LanguageType>(() => {
    return getSavedLanguage();
  });

  const handleLanguageChange = (newLang: LanguageType) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

  // Current tab
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    if (authRole === 'admin') return 'admin';
    if (authRole === 'customer') return 'home';
    return 'auth';
  });

  // Admin Preview Mode: Admin is previewing customer view
  const [isAdminPreview, setIsAdminPreview] = useState(false);

  // Selected project for detail view
  const [selectedProject, setSelectedProject] = useState<VehicleProject | null>(null);

  // Pending Registration Flow State
  const [pendingRegData, setPendingRegData] = useState<RegistrationFormData | null>(null);

  // Modal states
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [paymentDefaultProject, setPaymentDefaultProject] = useState('HONDA CD70');
  const [paymentDefaultAmount, setPaymentDefaultAmount] = useState(5000);
  const [paymentDefaultLabel, setPaymentDefaultLabel] = useState('1st Monthly Installment');
  const [paymentDefaultTokenNumber, setPaymentDefaultTokenNumber] = useState('');

  // -------------------------------------------------------------
  // FIRESTORE LIVE REAL-TIME CLOUD SYNCHRONIZATION
  // Connects Mobile Users and PC Admin to the same live database!
  // -------------------------------------------------------------
  useEffect(() => {
    testFirestoreConnection();

    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers) {
        setRegisteredUsers(cloudUsers);
        setStoredRegisteredUsers(cloudUsers);

        // Keep current active user state up-to-date with Firestore cloud
        setUser((currentUser) => {
          if (!currentUser) return currentUser;
          const matched = cloudUsers.find(
            (u) =>
              (u.id && u.id === currentUser.id) ||
              (u.uid && u.uid === currentUser.uid) ||
              (u.memberId && u.memberId.toLowerCase() === currentUser.memberId?.toLowerCase()) ||
              (u.phone && currentUser.phone && u.phone === currentUser.phone)
          );
          if (matched) {
            const merged = { ...currentUser, ...matched };
            setStoredSessionUser(merged);
            return merged;
          }
          return currentUser;
        });
      }
    });

    const unsubPayments = subscribeToPayments((cloudPayments) => {
      if (cloudPayments) {
        setPayments(cloudPayments);
        setStoredPayments(cloudPayments);
      }
    });

    const unsubActive = subscribeToActiveProjects((cloudActive) => {
      if (cloudActive) {
        setActiveProjects(cloudActive);
        setStoredActiveProjects(cloudActive);
      }
    });

    const unsubBanks = subscribeToBankAccounts((cloudBanks) => {
      if (cloudBanks) {
        setBankAccounts(cloudBanks);
        setStoredBankAccounts(cloudBanks);
      }
    });

    const unsubTerms = subscribeToTerms((cloudTerms) => {
      if (cloudTerms) {
        setTermsList(cloudTerms);
        setStoredTerms(cloudTerms);
      }
    });

    const unsubWinners = subscribeToWinners((cloudWinners) => {
      if (cloudWinners) {
        setWinners(cloudWinners);
        setStoredWinners(cloudWinners);
      }
    });

    const unsubProjects = subscribeToProjects((cloudProjects) => {
      if (cloudProjects) {
        setAllProjects(cloudProjects);
        setStoredProjects(cloudProjects);
      }
    });

    const unsubConfig = subscribeToAppConfig((_cfg) => {
      // Configuration synced from cloud without exposing server secrets
    });

    return () => {
      unsubUsers();
      unsubPayments();
      unsubActive();
      unsubBanks();
      unsubTerms();
      unsubWinners();
      unsubProjects();
      unsubConfig();
    };
  }, []);

  // Update terms handler (Saves to Firestore)
  const handleUpdateTerms = (newTerms: TermSection[]) => {
    setTermsList(newTerms);
    setStoredTerms(newTerms);
    saveAllTermsToFirestore(newTerms);
  };

  // Auth Handlers
  const handleCustomerLoginSuccess = (loggedInUser: UserProfile) => {
    const completeUser: UserProfile = {
      ...loggedInUser,
      isLoggedIn: true,
      role: 'customer'
    };
    setUser(completeUser);
    setAuthRole('customer');
    setIsAdminPreview(false);
    setStoredSessionUser(completeUser);
    clearStoredAdminToken();
    // Ensure written to cloud
    saveUserToFirestore(completeUser);
    setCurrentTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    setAuthRole('admin');
    setIsAdminPreview(false);
    setStoredAdminToken(token);
    removeStoredSessionUser();
    setCurrentTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    if (adminToken) {
      logoutAdminWithServer(adminToken);
    }
    setAdminToken(null);
    setAuthRole('none');
    setUser(null);
    setIsAdminPreview(false);
    clearStoredAdminToken();
    removeStoredSessionUser();
    setCurrentTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLockAdmin = () => {
    if (adminToken) {
      logoutAdminWithServer(adminToken);
    }
    setAdminToken(null);
    setAuthRole('none');
    setIsAdminPreview(false);
    clearStoredAdminToken();
    setCurrentTab('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateAdminPin = async (newPin: string): Promise<boolean> => {
    if (adminToken) {
      const res = await changeAdminPinWithServer(adminToken, newPin);
      if (!res.success) {
        throw new Error(res.message || 'Failed to update Master PIN');
      }
      return true;
    }
    return false;
  };

  const handleResetAllData = () => {
    setRegisteredUsers([]);
    setActiveProjects([]);
    setPayments([]);
    setWinners([]);
    clearAllResetData();
    if (user) {
      setUser((prev) => (prev ? { ...prev, activeTokensCount: 0, totalPaidAmount: 0 } : null));
    }
  };

  // Bank Account Handlers (Synced to Firestore)
  const handleUpdateBankAccount = (updatedAcc: BankAccountDetail) => {
    setBankAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
    saveBankAccountToFirestore(updatedAcc);
  };

  const handleAddBankAccount = (newAcc: BankAccountDetail) => {
    setBankAccounts((prev) => [...prev, newAcc]);
    saveBankAccountToFirestore(newAcc);
  };

  const handleDeleteBankAccount = (accId: string) => {
    setBankAccounts((prev) => prev.filter((a) => a.id !== accId));
    deleteBankAccountFromFirestore(accId);
  };

  // Registration Flow Handlers
  const handleProceedToTermsFromSignup = (formData: RegistrationFormData) => {
    setPendingRegData(formData);
    setCurrentTab('terms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalizeRegistrationFromTerms = () => {
    if (!pendingRegData) {
      setCurrentTab('auth');
      return;
    }

    const newUserId = `usr-${Date.now()}`;
    const generatedTokenNumber = `USR-${Date.now().toString().slice(-4)}`;

    const newUser: UserProfile = {
      uid: newUserId,
      id: newUserId,
      name: pendingRegData.fullName,
      full_name: pendingRegData.fullName,
      email: pendingRegData.email || '',
      password: pendingRegData.password,
      phoneNumber: pendingRegData.phone,
      phone_number: pendingRegData.phone,
      phone: pendingRegData.phone,
      cnic: pendingRegData.cnic,
      memberId: generatedTokenNumber,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      isLoggedIn: false,
      role: 'customer',
      account_status: 'pending',
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      activeTokensCount: 0,
      totalPaidAmount: 0
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setPendingRegData(null);

    // Save to Firestore Cloud immediately so PC Admin sees the new registered member live!
    saveUserToFirestore(newUser);

    // Automatically log them in
    setUser(newUser);
    setStoredSessionUser(newUser);
    setAuthRole('customer');
    setCurrentTab('dashboard'); // take them to dashboard directly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Project Selection -> open Detail View
  const handleSelectProject = (project: VehicleProject) => {
    setSelectedProject(project);
    setCurrentTab('project-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Join Project from Detail View
  const handleJoinClick = (project: VehicleProject) => {
    setSelectedProject(project);
    setIsJoinModalOpen(true);
  };

  // When enrollment succeeds:
  // Creates active enrollment with unique token(s) and registers customer payment under review (Pending Approval)
  const handleEnrollSuccess = (project: VehicleProject, tickets: string | string[], paymentRecord?: PaymentRecord) => {
    const isCommittee = true;
    const targetUserId = user?.id || user?.uid || `usr-${Date.now()}`;
    const tokenList = Array.isArray(tickets) ? tickets : [tickets];

    const newActiveProjectsList: UserActiveProject[] = tokenList.map((tok, index) => ({
      id: `act-${targetUserId}-${project.id}-${Date.now()}-${index}`,
      userId: targetUserId,
      userName: user?.name || user?.full_name || 'Member',
      userToken: tok,
      projectId: project.id,
      projectTitle: project.title,
      projectType: `${project.durationMonths || 36} Months Scheme`,
      ticketNumber: tok,
      monthlyKist: project.monthlyKist,
      tokenAmount: project.tokenPrice,
      totalUnits: project.durationMonths,
      completedUnits: 0, // Initialized to 0 until admin verifies and marks PAID!
      nextDueOrDrawDate: isCommittee ? '15 Nov 2024' : '01 Dec 2024',
      imageUrl: project.imageUrl,
      status: 'ACTIVE'
    }));

    setActiveProjects((prev) => [...newActiveProjectsList, ...prev]);
    newActiveProjectsList.forEach(act => saveActiveProjectToFirestore(act));

    if (paymentRecord) {
      const paymentId = paymentRecord.id.startsWith('pay_')
        ? paymentRecord.id
        : generatePaymentIdempotencyKey(targetUserId, paymentRecord.transactionRef, paymentRecord.projectName, paymentRecord.amount);
      const normalizedPayment = { ...paymentRecord, id: paymentId, userId: targetUserId };

      setPayments((prev) => {
        const idx = prev.findIndex((p) => p.id === paymentId || (p.transactionRef && p.transactionRef === normalizedPayment.transactionRef && p.userId === targetUserId));
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = normalizedPayment;
          return copy;
        }
        return [normalizedPayment, ...prev];
      });
      savePaymentToFirestore(normalizedPayment);
    }

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        activeTokensCount: (user.activeTokensCount || 0) + tokenList.length
      };
      setUser(updatedUser);
      saveUserToFirestore(updatedUser);
      setStoredSessionUser(updatedUser);
    }
  };

  // Handle Open Payment Modal with context
  const handleOpenPaymentModal = (projectName?: string, amount?: number, label?: string, tokenNumber?: string) => {
    setPaymentDefaultProject(projectName || 'HONDA CD70');
    setPaymentDefaultAmount(amount || 5000);
    setPaymentDefaultLabel(label || '1st Monthly Installment');
    setPaymentDefaultTokenNumber(tokenNumber || '');
    setIsPaymentModalOpen(true);
  };

  // When customer submits a payment
  const handlePaymentSuccess = (newPayment: PaymentRecord) => {
    const targetUserId = newPayment.userId || user?.id || user?.uid || '';
    const paymentId = newPayment.id.startsWith('pay_')
      ? newPayment.id
      : generatePaymentIdempotencyKey(targetUserId, newPayment.transactionRef, newPayment.projectName, newPayment.amount);
    const normalizedPayment = { ...newPayment, id: paymentId, userId: targetUserId };

    setPayments((prev) => {
      const idx = prev.findIndex((p) => p.id === paymentId || (p.transactionRef && p.transactionRef === normalizedPayment.transactionRef && p.userId === targetUserId));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = normalizedPayment;
        return copy;
      }
      return [normalizedPayment, ...prev];
    });

    // Save to Firestore so Admin on PC immediately gets the payment request!
    savePaymentToFirestore(normalizedPayment);

    // If already marked PAID by admin
    if (user && normalizedPayment.status === 'PAID') {
      const updatedUser = {
        ...user,
        totalPaidAmount: (user.totalPaidAmount || 0) + normalizedPayment.amount
      };
      setUser(updatedUser);
      saveUserToFirestore(updatedUser);
      setStoredSessionUser(updatedUser);
    }
  };

  // Handle navigation
  const handleNavigate = (tab: TabType) => {
    // If not logged in, redirect to auth
    if (authRole === 'none' && tab !== 'terms') {
      setCurrentTab('auth');
      return;
    }

    if (tab === 'admin') {
      if (authRole !== 'admin') {
        return;
      }
      setIsAdminPreview(false);
    }

    const resolvedTab = (tab as string) === 'projects' ? 'home' : tab;
    setCurrentTab(resolvedTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fallback safe active user
  const effectiveUser: UserProfile = user || {
    ...INITIAL_USER,
    name: 'Guest User (Preview)',
    memberId: '',
    phoneNumber: '0300 2344076',
    cnic: '41302-0000000-1'
  };

  // Customer isolated data views
  const isolatedActiveProjects = useMemo(() => {
    if (!user) return [];
    const uid = user.id || user.uid;
    const memberId = user.memberId;
    const name = (user.name || user.full_name || '').toLowerCase().trim();
    return activeProjects.filter((p) => {
      if (p.userId && uid && (p.userId === uid || p.userId === user.id || p.userId === user.uid)) return true;
      if (memberId && (p.ticketNumber === memberId || p.userToken === memberId)) return true;
      if (name && p.userName && p.userName.toLowerCase().trim() === name) return true;
      return false;
    });
  }, [activeProjects, user]);

  const isolatedPayments = useMemo(() => {
    if (!user) return [];
    const uid = user.id || user.uid;
    const memberId = user.memberId;
    const name = (user.name || user.full_name || '').toLowerCase().trim();
    return payments.filter((p) => {
      if (p.userId && uid && (p.userId === uid || p.userId === user.id || p.userId === user.uid)) return true;
      if (memberId && p.userToken === memberId) return true;
      if (name && p.userName && p.userName.toLowerCase().trim() === name) return true;
      return false;
    });
  }, [payments, user]);

  // -------------------------------------------------------------
  // VIEW 1: GATEWAY / NOT LOGGED IN
  // -------------------------------------------------------------
  if (authRole === 'none' && !(currentTab === 'terms' && pendingRegData)) {
    return (
      <div
        dir={LANGUAGES[lang].dir}
        className={`min-h-screen w-full bg-white dark:bg-[#121212] sm:bg-slate-100 sm:dark:bg-[#0a0a0a] flex items-center justify-center p-0 sm:p-4 ${LANGUAGES[lang].fontClass}`}
      >
        <ErrorBoundary fallbackTitle="Authentication Portal">
          <AuthView
            onLoginSuccess={handleCustomerLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onProceedToTerms={handleProceedToTermsFromSignup}
            savedFormData={pendingRegData}
            registeredUsers={registeredUsers}
            currentLang={lang}
            onLangChange={handleLanguageChange}
            vehicleProjects={allProjects}
            bankAccounts={bankAccounts}
          />
        </ErrorBoundary>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: REGISTRATION TERMS AGREEMENT VIEW
  // -------------------------------------------------------------
  if (currentTab === 'terms' && pendingRegData) {
    return (
      <div className="min-h-screen w-full bg-[#f7faf9] dark:bg-[#121212] sm:bg-slate-100 sm:dark:bg-[#0a0a0a] text-[#181c1c] dark:text-[#f7faf9] font-['Hanken_Grotesk'] flex flex-col items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-[480px] mx-auto flex flex-col min-h-screen bg-[#f7faf9] dark:bg-[#181c1c] relative sm:shadow-2xl sm:border-x border-0 border-[#e0e3e2]/60 dark:border-neutral-800">
          <ErrorBoundary fallbackTitle="Terms Agreement Portal">
            <TermsView
              onBack={() => {
                setCurrentTab('auth');
                setPendingRegData(null);
              }}
              isRegistrationFlow={true}
              pendingRegistrationData={pendingRegData}
              onConfirmRegistration={handleFinalizeRegistrationFromTerms}
              terms={termsList}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: DEDICATED MASTER ADMIN DASHBOARD
  // -------------------------------------------------------------
  if (authRole === 'admin' && !isAdminPreview) {
    return (
      <div className="min-h-screen bg-[#f7faf9] dark:bg-[#181c1c] text-[#181c1c] dark:text-[#f7faf9] font-['Hanken_Grotesk'] flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex flex-col min-h-screen relative p-3 sm:p-4">
          <ErrorBoundary fallbackTitle="Master Admin Panel">
            <AdminView
              onBack={handleLockAdmin}
              onLockAdmin={handleLockAdmin}
              onPreviewCustomerView={() => {
                setIsAdminPreview(true);
                setCurrentTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onResetAllData={handleResetAllData}
              adminToken={adminToken}
              onUpdateAdminPin={handleUpdateAdminPin}
              users={registeredUsers}
              payments={payments}
              projects={allProjects}
              winners={winners}
              bankAccounts={bankAccounts}
              activeProjects={activeProjects}
              terms={termsList}
              onUpdateTerms={handleUpdateTerms}
            onApprovePayment={(paymentId) => {
              const targetPayment = payments.find((p) => p.id === paymentId);
              if (targetPayment) {
                const approvedPayment: PaymentRecord = { ...targetPayment, status: 'PAID' };
                setPayments((prev) =>
                  prev.map((p) => (p.id === paymentId ? approvedPayment : p))
                );
                savePaymentToFirestore(approvedPayment);

                // Update active project unit count and activate status
                const pTokens = (approvedPayment.userToken || '')
                  .split(',')
                  .map((t) => t.trim().toUpperCase())
                  .filter(Boolean);

                let unitsToAdd = 1;
                const matchMonths =
                  (approvedPayment.installmentLabel || '').match(/Total\s*(\d+)\s*Mos/i) ||
                  (approvedPayment.installmentLabel || '').match(/(\d+)\s*(?:past\s*overdue\s*months|months)/i);
                if (matchMonths && matchMonths[1]) {
                  unitsToAdd = parseInt(matchMonths[1], 10) || 1;
                }

                setActiveProjects((prev) => {
                  const updated = prev.map((act) => {
                    const actTitle = act.projectTitle.toLowerCase().trim();
                    const payTitle = approvedPayment.projectName.toLowerCase().trim();
                    const isProjectMatch =
                      actTitle === payTitle ||
                      actTitle.includes(payTitle) ||
                      payTitle.includes(actTitle);

                    const isUserMatch =
                      !approvedPayment.userId ||
                      act.userId === approvedPayment.userId;

                    const currentTicket = (act.ticketNumber || '').trim().toUpperCase();
                    const isTokenMatch =
                      pTokens.length === 0 || pTokens.includes(currentTicket);

                    if (isProjectMatch && isUserMatch && isTokenMatch) {
                      const newUnits = Math.min(act.totalUnits, (act.completedUnits || 0) + unitsToAdd);
                      const actUpdated: UserActiveProject = {
                        ...act,
                        status: 'ACTIVE',
                        completedUnits: newUnits
                      };
                      saveActiveProjectToFirestore(actUpdated);
                      return actUpdated;
                    }
                    return act;
                  });
                  return updated;
                });

                // Update user totalPaidAmount
                if (approvedPayment.userId || approvedPayment.userToken) {
                  const matchedUser = registeredUsers.find(
                    (u) =>
                      u.id === approvedPayment.userId ||
                      u.uid === approvedPayment.userId ||
                      u.memberId === approvedPayment.userToken
                  );
                  if (matchedUser) {
                    const userUpd: UserProfile = {
                      ...matchedUser,
                      totalPaidAmount: (matchedUser.totalPaidAmount || 0) + approvedPayment.amount
                    };
                    saveUserToFirestore(userUpd);
                  }
                }
              }
            }}
            onRejectPayment={(paymentId, reason) => {
              const targetPayment = payments.find((p) => p.id === paymentId);
              if (targetPayment) {
                const rejectedPayment: PaymentRecord = {
                  ...targetPayment,
                  status: 'REJECTED',
                  rejectReason: reason
                };
                setPayments((prev) =>
                  prev.map((p) => (p.id === paymentId ? rejectedPayment : p))
                );
                savePaymentToFirestore(rejectedPayment);
              }
            }}
            onAddProject={(newProj) => {
              setAllProjects((prev) => [newProj, ...prev]);
              saveProjectToFirestore(newProj);
            }}
            onUpdateProject={(updatedProj) => {
              setAllProjects((prev) =>
                prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
              );
              saveProjectToFirestore(updatedProj);
            }}
            onDeleteActiveProject={(tokenId) => {
              const act = activeProjects.find(p => p.id === tokenId);
              if (act) {
                 const tokenPayments = payments.filter(p => p.userToken === act.ticketNumber);
                 tokenPayments.forEach(pay => deletePaymentFromFirestore(pay.id));
                 setPayments(prev => prev.filter(p => p.userToken !== act.ticketNumber));
              }
              setActiveProjects((prev) => prev.filter((p) => p.id !== tokenId));
              deleteActiveProjectFromFirestore(tokenId);
            }}
            onDeleteProject={(projId) => {
              // 1. Find all active projects (tokens) for this scheme
              const schemeTokens = activeProjects.filter(p => p.projectId === projId);
              
              // 2. For each token, delete the token and all its payments
              schemeTokens.forEach(act => {
                 const tokenPayments = payments.filter(p => p.userToken === act.ticketNumber);
                 tokenPayments.forEach(pay => deletePaymentFromFirestore(pay.id));
                 deleteActiveProjectFromFirestore(act.id);
              });

              // 3. Update local state for payments & active projects
              if (schemeTokens.length > 0) {
                 const ticketNumbers = schemeTokens.map(t => t.ticketNumber);
                 setPayments(prev => prev.filter(p => !ticketNumbers.includes(p.userToken || '')));
                 setActiveProjects(prev => prev.filter(p => p.projectId !== projId));
              }

              // 4. Delete the project
              setAllProjects((prev) => prev.filter((p) => p.id !== projId));
              deleteProjectFromFirestore(projId);
            }}
            onAddUser={(newUser) => {
              setRegisteredUsers((prev) => [newUser, ...prev]);
              saveUserToFirestore(newUser);
            }}
            onUpdateUser={(updatedUser) => {
              setRegisteredUsers((prev) =>
                prev.map((u) =>
                  u.id === updatedUser.id ||
                  u.uid === updatedUser.uid ||
                  u.memberId === updatedUser.memberId
                    ? updatedUser
                    : u
                )
              );
              saveUserToFirestore(updatedUser);
              if (
                user &&
                (user.id === updatedUser.id ||
                  user.uid === updatedUser.uid ||
                  user.memberId === updatedUser.memberId)
              ) {
                const merged = { ...user, ...updatedUser };
                setUser(merged);
                setStoredSessionUser(merged);
              }
            }}
            onDeleteUser={(userId) => {
              // 1. Find all active projects for this user
              const userTokens = activeProjects.filter(p => p.userId === userId);
              
              // 2. For each token, delete the token and all its payments
              userTokens.forEach(act => {
                 const tokenPayments = payments.filter(p => p.userToken === act.ticketNumber);
                 tokenPayments.forEach(pay => deletePaymentFromFirestore(pay.id));
                 deleteActiveProjectFromFirestore(act.id);
              });

              // 3. Update local state for payments & active projects
              if (userTokens.length > 0) {
                 const ticketNumbers = userTokens.map(t => t.ticketNumber);
                 setPayments(prev => prev.filter(p => !ticketNumbers.includes(p.userToken || '')));
                 setActiveProjects(prev => prev.filter(p => p.userId !== userId));
              }

              // 4. Delete the user
              setRegisteredUsers((prev) =>
                prev.filter(
                  (u) => u.id !== userId && u.uid !== userId && u.memberId !== userId
                )
              );
              deleteUserFromFirestore(userId);
            }}
            onAddPayment={(newPayment) => {
              setPayments((prev) => [newPayment, ...prev]);
              savePaymentToFirestore(newPayment);
            }}
            onUpdatePayment={(updatedPayment) => {
              setPayments((prev) =>
                prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
              );
              savePaymentToFirestore(updatedPayment);
            }}
            onDeletePayment={(paymentId) => {
              const targetPayment = payments.find((p) => p.id === paymentId);
              setPayments((prev) => prev.filter((p) => p.id !== paymentId));
              deletePaymentFromFirestore(paymentId);

              // If deleted payment was previously PAID, reverse user's balance and active project completed units
              if (targetPayment && targetPayment.status === 'PAID') {
                if (targetPayment.userId || targetPayment.userToken) {
                  const matchedUser = registeredUsers.find(
                    (u) =>
                      u.id === targetPayment.userId ||
                      u.uid === targetPayment.userId ||
                      u.memberId === targetPayment.userToken
                  );
                  if (matchedUser) {
                    const newTotal = Math.max(0, (matchedUser.totalPaidAmount || 0) - targetPayment.amount);
                    const userUpd: UserProfile = {
                      ...matchedUser,
                      totalPaidAmount: newTotal
                    };
                    saveUserToFirestore(userUpd);
                  }
                }

                // Reverse active project unit count
                setActiveProjects((prev) => {
                  return prev.map((act) => {
                    if (
                      act.projectTitle.toLowerCase().includes(targetPayment.projectName.toLowerCase()) ||
                      targetPayment.projectName.toLowerCase().includes(act.projectTitle.toLowerCase())
                    ) {
                      const newUnits = Math.max(0, act.completedUnits - 1);
                      const actUpdated = { ...act, completedUnits: newUnits };
                      saveActiveProjectToFirestore(actUpdated);
                      return actUpdated;
                    }
                    return act;
                  });
                });
              }
            }}
            onAddWinner={(newWinner) => {
              setWinners((prev) => [newWinner, ...prev]);
              saveWinnerToFirestore(newWinner);
            }}
            onUpdateWinner={(updatedWinner) => {
              setWinners((prev) =>
                prev.map((w) => (w.id === updatedWinner.id ? updatedWinner : w))
              );
              saveWinnerToFirestore(updatedWinner);
            }}
            onDeleteWinner={(winnerId) => {
              setWinners((prev) => prev.filter((w) => w.id !== winnerId));
              deleteWinnerFromFirestore(winnerId);
            }}
            onUpdateBankAccount={handleUpdateBankAccount}
            onAddBankAccount={handleAddBankAccount}
            onDeleteBankAccount={handleDeleteBankAccount}
            currentLang={lang}
            onLangChange={handleLanguageChange}
          />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: DEDICATED CUSTOMER PORTAL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-[#f7faf9] dark:bg-[#121212] sm:bg-slate-100 sm:dark:bg-[#0a0a0a] text-[#181c1c] dark:text-[#f7faf9] font-['Hanken_Grotesk'] flex flex-col justify-between selection:bg-[#ffdad8] selection:text-[#98001b]">
      {/* Mobile Network Status Toast */}
      <NetworkStatusIndicator currentLang={lang} />

      <div
        dir={LANGUAGES[lang].dir}
        className={`w-full sm:max-w-[480px] mx-auto flex flex-col min-h-screen relative sm:shadow-2xl bg-[#f7faf9] dark:bg-[#181c1c] sm:border-x border-0 border-[#e0e3e2]/60 dark:border-neutral-800 ${LANGUAGES[lang].fontClass}`}
      >
        {/* Mobile PWA Install Helper Banner */}
        <InstallAppBanner currentLang={lang} />

        {/* Admin Preview Mode Floating Top Bar */}
        {authRole === 'admin' && isAdminPreview && (
          <div className="bg-[#181c1c] text-white p-2.5 px-4 flex items-center justify-between border-b border-[#fed488] sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-xs text-[#fed488]">
                {lang === 'sd' ? 'ايڊمن پري ويو موڊ' : lang === 'ur' ? 'ایڈمن پری ویو موڈ' : 'Admin Preview Mode'}
              </span>
            </div>
            <button
              onClick={() => {
                setIsAdminPreview(false);
                setCurrentTab('admin');
              }}
              className="bg-[#98001b] hover:bg-[#be1e2d] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'sd' ? 'ايڊمن پينل ڏانهن واپس وڃو' : lang === 'ur' ? 'ایڈمن پینل پر واپس جائیں' : 'Back to Admin Panel'}</span>
            </button>
          </div>
        )}

        {/* Top App Bar (Sticky) */}
        {currentTab !== 'project-detail' && effectiveUser?.account_status !== 'pending' && (
          <TopAppBar
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenBrochure={() => setIsBrochureOpen(true)}
            unreadCount={0}
            currentTab={currentTab}
            onNavigate={handleNavigate}
            currentLang={lang}
            onLangChange={handleLanguageChange}
          />
        )}

        {/* Main Content Body */}
        <main className="flex-1 pb-24">
          <ErrorBoundary fallbackTitle="Customer Portal Section">
            {effectiveUser?.account_status === 'pending' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
                <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
                <h2 className="text-xl font-bold text-[#181c1c] dark:text-white mb-2">
                  {lang === 'sd' ? 'درخواست جمع ٿي وئي' : lang === 'ur' ? 'درخواست جمع ہو گئی' : 'Application Submitted'}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {lang === 'sd' 
                    ? 'توهان جي درخواست ايڊمن ڏانهن منظوري لاءِ موڪلي وئي آهي. منظوري ملڻ کان پوءِ توهان پنهنجي اڪائونٽ ۾ اڳتي وڌي سگهندا.' 
                    : lang === 'ur' 
                    ? 'آپ کی درخواست ایڈمن کو منظوری کے لئے بھیج دی گئی ہے۔ منظوری آنے پر آپ اپنے اکاؤنٹ میں آگے بڑھ سکیں گے۔' 
                    : 'Your application has been sent to the admin for approval. You will be able to proceed once approved.'}
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-8 bg-[#98001b] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#be1e2d] transition-colors"
                >
                  {lang === 'sd' ? 'لاگ آئوٽ ڪريو' : lang === 'ur' ? 'لاگ آؤٹ کریں' : 'Log Out'}
                </button>
              </div>
            ) : (
              <>
                {(currentTab === 'home' || currentTab === 'projects') && (
                  <HomeView
                    projects={allProjects}
                    onSelectProject={handleSelectProject}
                    onNavigate={handleNavigate}
                    onOpenBrochure={() => setIsBrochureOpen(true)}
                    currentLang={lang}
                  />
                )}

            {currentTab === 'project-detail' && selectedProject && (
              <ProjectDetailView
                project={selectedProject}
                onBack={() => handleNavigate('home')}
                onJoinClick={handleJoinClick}
                currentLang={lang}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardView
                user={effectiveUser}
                activeProjects={isolatedActiveProjects}
                winners={winners}
                onNavigate={handleNavigate}
                onPayInstallment={(proj) =>
                  handleOpenPaymentModal(proj.projectTitle, proj.monthlyKist || 5000, undefined, proj.ticketNumber)
                }
                onBuyToken={(proj) =>
                  handleOpenPaymentModal(proj.projectTitle, proj.tokenAmount || 1000, undefined, proj.ticketNumber)
                }
                currentLang={lang}
              />
            )}

            {currentTab === 'payments' && (
              <PaymentsView
                payments={isolatedPayments}
                activeProjects={isolatedActiveProjects}
                winners={winners}
                totalPaid={effectiveUser.totalPaidAmount || 0}
                activeTokensCount={effectiveUser.activeTokensCount || 0}
                onOpenPaymentModal={handleOpenPaymentModal}
                currentLang={lang}
                userName={effectiveUser.name}
              />
            )}

            {currentTab === 'luckydraw' && (
              <LuckyDrawView
                winners={winners}
                projects={allProjects}
                activeProjects={activeProjects}
                currentLang={lang}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                user={effectiveUser}
                activeProjects={isolatedActiveProjects}
                onUpdateProfile={(updated) => {
                  const upd = { ...effectiveUser, ...updated };
                  setUser(upd);
                  setRegisteredUsers((prev) =>
                    prev.map((u) =>
                      (u.id && upd.id && u.id === upd.id) ||
                      (u.uid && upd.uid && u.uid === upd.uid) ||
                      (u.memberId && upd.memberId && u.memberId === upd.memberId) ||
                      (u.phone && upd.phone && u.phone === upd.phone)
                        ? { ...u, ...upd }
                        : u
                    )
                  );
                  saveUserToFirestore(upd);
                  setStoredSessionUser(upd);
                }}
                onNavigate={handleNavigate}
                onOpenBrochure={() => setIsBrochureOpen(true)}
                onLogout={handleLogout}
                currentLang={lang}
              />
            )}

            {currentTab === 'terms' && (
              <TermsView
                onBack={() => handleNavigate('home')}
                isRegistrationFlow={false}
                terms={termsList}
                currentLang={lang}
              />
            )}
              </>
            )}
          </ErrorBoundary>
        </main>

        {/* Bottom Navigation Bar */}
        {currentTab !== 'project-detail' && effectiveUser?.account_status !== 'pending' && (
          <BottomNavBar
            currentTab={currentTab}
            onTabChange={handleNavigate}
            currentLang={lang}
          />
        )}
      </div>

      {/* Global Modals & Drawers */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        user={effectiveUser}
        onOpenBrochure={() => setIsBrochureOpen(true)}
        onLogout={handleLogout}
        currentLang={lang}
        onLangChange={handleLanguageChange}
      />

      <BrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        onSelectProject={handleSelectProject}
        projects={allProjects}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        defaultProject={paymentDefaultProject}
        defaultAmount={paymentDefaultAmount}
        defaultLabel={paymentDefaultLabel}
        defaultTokenNumber={paymentDefaultTokenNumber}
        bankAccounts={bankAccounts}
        currentUser={effectiveUser}
        activeProjects={activeProjects}
        allProjects={allProjects}
      />

      <JoinProjectModal
        isOpen={isJoinModalOpen}
        project={selectedProject}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={handleEnrollSuccess}
        currentUser={effectiveUser}
        bankAccounts={bankAccounts}
        existingActiveProjects={activeProjects}
        onNavigateToTerms={() => {
          setIsJoinModalOpen(false);
          handleNavigate('terms');
        }}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;

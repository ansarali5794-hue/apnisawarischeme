import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile,
  UserActiveProject,
  PaymentRecord,
  BankAccountDetail,
  WinnerRecord,
  VehicleProject,
  TermSection
} from '../types';
import {
  DEFAULT_BANK_ACCOUNTS,
  EXACT_TERMS_SECTIONS,
  VEHICLE_PROJECTS,
  WINNERS_LIST,
  INITIAL_USER
} from '../data/mockData';
import { sanitizeObject } from './security';

// Helper to recursively remove undefined fields and sanitize against injection
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  const cleanObj = sanitizeObject(data);
  if (Array.isArray(cleanObj)) {
    return cleanObj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof cleanObj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(cleanObj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return cleanObj;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.warn('[Firestore] Handled operation info:', JSON.stringify(errInfo));
}

// Test connection on initialization
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'test/connection');
    return false;
  }
}

// -------------------------------------------------------------
// 1. USERS COLLECTION (Real-time Cloud Sync across Mobile & PC)
// -------------------------------------------------------------
export function subscribeToUsers(onUpdate: (users: UserProfile[]) => void) {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
      } else {
        const usersList: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            usersList.push({ ...data, id: docSnap.id } as UserProfile);
          }
        });
        // Sort newest first
        usersList.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });
        onUpdate(usersList);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  );
}

export async function saveUserToFirestore(user: UserProfile): Promise<void> {
  try {
    const docId = user.id || user.uid || user.memberId;
    if (!docId) return;
    const cleanUser = sanitizeForFirestore({
      ...user,
      id: docId,
      uid: user.uid || docId,
      name: user.name || user.full_name || 'Member',
      full_name: user.full_name || user.name || 'Member',
      phone_number: user.phone_number || user.phoneNumber || user.phone || '',
      phone: user.phone || user.phoneNumber || '',
      phoneNumber: user.phoneNumber || user.phone || '',
      cnic: user.cnic || '',
      address: user.address || '',
      email: user.email || '',
      password: user.password || '',
      avatarUrl: user.avatarUrl || '',
      memberId: user.memberId || `TK-${Date.now()}`,
      account_status: user.account_status || 'active',
      role: user.role || 'customer',
      totalPaidAmount: user.totalPaidAmount || 0,
      activeTokensCount: user.activeTokensCount || 0,
      created_at: user.created_at || new Date().toISOString()
    });
    await setDoc(doc(db, 'users', docId), cleanUser, { merge: true });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Firestore] Error saving user:', err);
    }
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Firestore] Error deleting user:', err);
    }
    throw err;
  }
}

// -------------------------------------------------------------
// 2. ACTIVE PROJECTS / ENROLLMENTS
// -------------------------------------------------------------
export function subscribeToActiveProjects(onUpdate: (projects: UserActiveProject[]) => void) {
  const ref = collection(db, 'activeProjects');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: UserActiveProject[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserActiveProject);
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'activeProjects');
    }
  );
}

export async function saveActiveProjectToFirestore(activeProject: UserActiveProject): Promise<void> {
  try {
    const docId = activeProject.id || `act-${Date.now()}`;
    const cleanData = sanitizeForFirestore({ ...activeProject, id: docId });
    await setDoc(doc(db, 'activeProjects', docId), cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'activeProjects');
  }
}

export async function deleteActiveProjectFromFirestore(activeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'activeProjects', activeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `activeProjects/${activeId}`);
  }
}

// -------------------------------------------------------------
// 3. PAYMENTS COLLECTION
// -------------------------------------------------------------
export function subscribeToPayments(onUpdate: (payments: PaymentRecord[]) => void) {
  const ref = collection(db, 'payments');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: PaymentRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data) {
          list.push({ ...data, id: docSnap.id } as PaymentRecord);
        }
      });
      // Sort newest first
      list.sort((a, b) => {
        const timeA = a.id?.startsWith('pay-') ? parseInt(a.id.replace('pay-', '')) || 0 : 0;
        const timeB = b.id?.startsWith('pay-') ? parseInt(b.id.replace('pay-', '')) || 0 : 0;
        return timeB - timeA;
      });
      onUpdate(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'payments');
    }
  );
}

export async function savePaymentToFirestore(payment: PaymentRecord): Promise<void> {
  try {
    const docId = payment.id || `pay-${Date.now()}`;
    const cleanData = sanitizeForFirestore({ ...payment, id: docId });
    await setDoc(doc(db, 'payments', docId), cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'payments');
  }
}

export async function deletePaymentFromFirestore(paymentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'payments', paymentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `payments/${paymentId}`);
  }
}

// -------------------------------------------------------------
// 4. BANK ACCOUNTS
// -------------------------------------------------------------
export function subscribeToBankAccounts(onUpdate: (accounts: BankAccountDetail[]) => void) {
  const ref = collection(db, 'bankAccounts');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_BANK_ACCOUNTS);
      } else {
        const list: BankAccountDetail[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            list.push({ ...data, id: docSnap.id } as BankAccountDetail);
          }
        });
        onUpdate(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'bankAccounts');
      // Do NOT overwrite user settings with mock templates on network glitch
    }
  );
}

export async function saveBankAccountToFirestore(account: BankAccountDetail): Promise<void> {
  try {
    const docId = account.id || `bank-${Date.now()}`;
    const cleanData = sanitizeForFirestore({ ...account, id: docId });
    await setDoc(doc(db, 'bankAccounts', docId), cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'bankAccounts');
  }
}

export async function deleteBankAccountFromFirestore(accId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'bankAccounts', accId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `bankAccounts/${accId}`);
  }
}

// -------------------------------------------------------------
// 5. TERMS & CONDITIONS CLAUSES
// -------------------------------------------------------------
export function subscribeToTerms(onUpdate: (terms: TermSection[]) => void) {
  const ref = collection(db, 'terms');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(EXACT_TERMS_SECTIONS);
      } else {
        const list: TermSection[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            list.push({ ...data, id: docSnap.id } as TermSection);
          }
        });
        // Sort by numerical clause number
        list.sort((a, b) => parseInt(a.number) - parseInt(b.number));
        onUpdate(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'terms');
      // Do NOT overwrite user settings with mock templates on network glitch
    }
  );
}

export async function saveAllTermsToFirestore(terms: TermSection[]): Promise<void> {
  try {
    const existingSnap = await getDocs(collection(db, 'terms'));
    const newDocIds = new Set<string>();

    // Save each term clause
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const docId = `term-${String(i + 1).padStart(2, '0')}`;
      newDocIds.add(docId);
      const cleanData = sanitizeForFirestore({ ...term, id: docId, number: String(i + 1) });
      await setDoc(doc(db, 'terms', docId), cleanData);
    }

    // Delete any documents that are no longer in the terms list
    for (const d of existingSnap.docs) {
      if (!newDocIds.has(d.id)) {
        await deleteDoc(doc(db, 'terms', d.id));
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'terms');
  }
}

// -------------------------------------------------------------
// 6. WINNERS
// -------------------------------------------------------------
export function subscribeToWinners(onUpdate: (winners: WinnerRecord[]) => void) {
  const ref = collection(db, 'winners');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(WINNERS_LIST);
      } else {
        const list: WinnerRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            list.push({ ...data, id: docSnap.id } as WinnerRecord);
          }
        });
        onUpdate(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'winners');
      // Do NOT overwrite user settings with mock templates on network glitch
    }
  );
}

export async function saveWinnerToFirestore(winner: WinnerRecord): Promise<void> {
  try {
    const docId = winner.id || `win-${Date.now()}`;
    const cleanData = sanitizeForFirestore({ ...winner, id: docId });
    await setDoc(doc(db, 'winners', docId), cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'winners');
  }
}

export async function deleteWinnerFromFirestore(winnerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'winners', winnerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `winners/${winnerId}`);
  }
}

// -------------------------------------------------------------
// 7. VEHICLE PROJECTS
// -------------------------------------------------------------
export function subscribeToProjects(onUpdate: (projects: VehicleProject[]) => void) {
  const ref = collection(db, 'projects');
  return onSnapshot(
    ref,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(VEHICLE_PROJECTS);
      } else {
        const list: VehicleProject[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            list.push({ ...data, id: docSnap.id } as VehicleProject);
          }
        });
        onUpdate(list);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'projects');
      // Do NOT overwrite live user projects with mock templates on network glitch
    }
  );
}

export async function saveProjectToFirestore(project: VehicleProject): Promise<void> {
  try {
    const cleanData = sanitizeForFirestore(project);
    await setDoc(doc(db, 'projects', project.id), cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'projects');
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}`);
  }
}

// -------------------------------------------------------------
// 8. APP CONFIG (Public System settings, Announcements, Notices)
// -------------------------------------------------------------
export function subscribeToAppConfig(onUpdate: (config: { announcement?: string; isMaintenance?: boolean }) => void) {
  const ref = doc(db, 'appConfig', 'settings');
  return onSnapshot(
    ref,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as { announcement?: string; isMaintenance?: boolean });
      } else {
        onUpdate({});
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'appConfig/settings');
    }
  );
}

export async function saveAppConfigToFirestore(config: { announcement?: string; isMaintenance?: boolean }): Promise<void> {
  try {
    const cleanData = sanitizeForFirestore(config);
    await setDoc(doc(db, 'appConfig', 'settings'), cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'appConfig/settings');
  }
}

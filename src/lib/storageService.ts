import {
  UserProfile,
  UserActiveProject,
  PaymentRecord,
  VehicleProject,
  WinnerRecord,
  BankAccountDetail,
  TermSection
} from '../types';
import {
  INITIAL_PAYMENTS,
  VEHICLE_PROJECTS,
  WINNERS_LIST,
  DEFAULT_BANK_ACCOUNTS,
  USER_ACTIVE_PROJECTS,
  EXACT_TERMS_SECTIONS
} from '../data/mockData';

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'as_admin_token',
  SESSION_USER: 'as_session_user',
  SESSION_ADMIN: 'as_session_admin',
  REGISTERED_USERS: 'as_registered_users',
  ACTIVE_PROJECTS: 'as_active_projects',
  PAYMENTS: 'as_payments',
  ALL_PROJECTS: 'as_all_projects',
  WINNERS: 'as_winners',
  BANK_ACCOUNTS: 'as_bank_accounts',
  TERMS_SECTIONS: 'as_terms_sections',
  LANGUAGE: 'as_user_language'
} as const;

/**
 * Generic safe getItem with JSON parsing & fallback
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === '') {
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to read or parse key "${key}":`, err);
    return fallback;
  }
}

/**
 * Generic safe setItem with JSON serialization
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to write key "${key}":`, err);
  }
}

/**
 * Generic safe removeItem
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove key "${key}":`, err);
  }
}

/**
 * Safe Session Storage helpers
 */
export function getSessionItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setSessionItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] Failed to set session key "${key}":`, err);
  }
}

export function removeSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove session key "${key}":`, err);
  }
}

// -------------------------------------------------------------
// Typed Domain Accessors & Mutators
// -------------------------------------------------------------

export function getStoredAdminToken(): string | null {
  return getSessionItem(STORAGE_KEYS.ADMIN_TOKEN);
}

export function setStoredAdminToken(token: string): void {
  setSessionItem(STORAGE_KEYS.ADMIN_TOKEN, token);
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_ADMIN, 'true');
  } catch {}
}

export function clearStoredAdminToken(): void {
  removeSessionItem(STORAGE_KEYS.ADMIN_TOKEN);
  removeStorageItem(STORAGE_KEYS.SESSION_ADMIN);
}

export function getStoredSessionUser(): UserProfile | null {
  return getStorageItem<UserProfile | null>(STORAGE_KEYS.SESSION_USER, null);
}

export function setStoredSessionUser(user: UserProfile): void {
  setStorageItem(STORAGE_KEYS.SESSION_USER, user);
}

export function removeStoredSessionUser(): void {
  removeStorageItem(STORAGE_KEYS.SESSION_USER);
}

export function getStoredRegisteredUsers(): UserProfile[] {
  return getStorageItem<UserProfile[]>(STORAGE_KEYS.REGISTERED_USERS, []);
}

export function setStoredRegisteredUsers(users: UserProfile[]): void {
  setStorageItem(STORAGE_KEYS.REGISTERED_USERS, users);
}

export function getStoredActiveProjects(): UserActiveProject[] {
  return getStorageItem<UserActiveProject[]>(STORAGE_KEYS.ACTIVE_PROJECTS, USER_ACTIVE_PROJECTS);
}

export function setStoredActiveProjects(projects: UserActiveProject[]): void {
  setStorageItem(STORAGE_KEYS.ACTIVE_PROJECTS, projects);
}

export function getStoredPayments(): PaymentRecord[] {
  return getStorageItem<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
}

export function setStoredPayments(payments: PaymentRecord[]): void {
  setStorageItem(STORAGE_KEYS.PAYMENTS, payments);
}

export function getStoredProjects(): VehicleProject[] {
  return getStorageItem<VehicleProject[]>(STORAGE_KEYS.ALL_PROJECTS, VEHICLE_PROJECTS);
}

export function setStoredProjects(projects: VehicleProject[]): void {
  setStorageItem(STORAGE_KEYS.ALL_PROJECTS, projects);
}

export function getStoredWinners(): WinnerRecord[] {
  return getStorageItem<WinnerRecord[]>(STORAGE_KEYS.WINNERS, WINNERS_LIST);
}

export function setStoredWinners(winners: WinnerRecord[]): void {
  setStorageItem(STORAGE_KEYS.WINNERS, winners);
}

export function getStoredBankAccounts(): BankAccountDetail[] {
  return getStorageItem<BankAccountDetail[]>(STORAGE_KEYS.BANK_ACCOUNTS, DEFAULT_BANK_ACCOUNTS);
}

export function setStoredBankAccounts(accounts: BankAccountDetail[]): void {
  setStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, accounts);
}

export function getStoredTerms(): TermSection[] {
  return getStorageItem<TermSection[]>(STORAGE_KEYS.TERMS_SECTIONS, EXACT_TERMS_SECTIONS);
}

export function setStoredTerms(terms: TermSection[]): void {
  setStorageItem(STORAGE_KEYS.TERMS_SECTIONS, terms);
}

export function clearAllLocalUserAndAdminSession(): void {
  clearStoredAdminToken();
  removeStoredSessionUser();
}

export function clearAllResetData(): void {
  removeStorageItem(STORAGE_KEYS.REGISTERED_USERS);
  removeStorageItem(STORAGE_KEYS.ACTIVE_PROJECTS);
  removeStorageItem(STORAGE_KEYS.PAYMENTS);
  removeStorageItem(STORAGE_KEYS.WINNERS);
}

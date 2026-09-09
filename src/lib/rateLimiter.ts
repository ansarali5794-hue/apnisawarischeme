/**
 * Anti-Brute-Force Rate Limiter
 * Tracks and limits failed attempts for sensitive actions (Login, Admin PIN, OTP)
 */

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const STORAGE_PREFIX = 'sec_ratelimit_';

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000,
  lockoutDurationMs: number = 60 * 1000
): { isAllowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  try {
    const raw = sessionStorage.getItem(getStorageKey(key));
    if (!raw) {
      return { isAllowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
    }

    const record: RateLimitRecord = JSON.parse(raw);
    const now = Date.now();

    // Check if currently locked out
    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { isAllowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    // Check if the sliding window expired
    if (now - record.firstAttempt > windowMs) {
      sessionStorage.removeItem(getStorageKey(key));
      return { isAllowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
    }

    const remainingAttempts = Math.max(0, maxAttempts - record.count);
    return {
      isAllowed: record.count < maxAttempts,
      remainingAttempts,
      retryAfterSeconds: 0
    };
  } catch {
    return { isAllowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
  }
}

export function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000,
  lockoutDurationMs: number = 60 * 1000
): { isAllowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  try {
    const storageKey = getStorageKey(key);
    const raw = sessionStorage.getItem(storageKey);
    const now = Date.now();

    let record: RateLimitRecord;

    if (!raw) {
      record = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      };
    } else {
      record = JSON.parse(raw);
      // Reset if window expired
      if (now - record.firstAttempt > windowMs) {
        record = {
          count: 1,
          firstAttempt: now,
          lastAttempt: now
        };
      } else {
        record.count += 1;
        record.lastAttempt = now;
      }
    }

    if (record.count >= maxAttempts) {
      // Exponential backoff or base lockout
      record.lockedUntil = now + lockoutDurationMs;
      sessionStorage.setItem(storageKey, JSON.stringify(record));
      const retryAfterSeconds = Math.ceil(lockoutDurationMs / 1000);
      return { isAllowed: false, remainingAttempts: 0, retryAfterSeconds };
    }

    sessionStorage.setItem(storageKey, JSON.stringify(record));
    const remainingAttempts = Math.max(0, maxAttempts - record.count);
    return { isAllowed: true, remainingAttempts, retryAfterSeconds: 0 };
  } catch {
    return { isAllowed: true, remainingAttempts: 1, retryAfterSeconds: 0 };
  }
}

export function resetRateLimit(key: string): void {
  try {
    sessionStorage.removeItem(getStorageKey(key));
  } catch {
    // Ignore storage errors
  }
}

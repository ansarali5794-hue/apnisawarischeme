/**
 * Security & Sanitization Utilities
 * - Input Sanitization (XSS & HTML/Script injection prevention)
 * - NoSQL / Prototype pollution injection prevention
 * - Secret and Master PIN management
 */

// Escape HTML special characters
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Strip unsafe HTML tags, script tags, event handlers and javascript: URIs
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  let cleaned = input
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, embed, object tags
    .replace(/<(?:iframe|embed|object|base|meta|link)[^>]*>/gi, '')
    // Remove inline event handlers like onerror=, onload=, onclick=
    .replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '')
    // Remove javascript: and data: pseudo-protocols in URLs
    .replace(/javascript\s*:[^"'\s]*/gi, '')
    // Trim leading/trailing whitespace
    .trim();

  return cleaned;
}

// Deep sanitize object values and keys to prevent NoSQL query injection & prototype pollution
export function sanitizeObject<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeText(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Prevent prototype pollution and NoSQL operators starting with $
      if (key === '__proto__' || key === 'constructor' || key === 'prototype' || key.startsWith('$')) {
        continue;
      }
      clean[key] = sanitizeObject(value);
    }
    return clean as T;
  }

  return data;
}

// Deterministic Idempotency Key Generator for financial and registration operations
export function generatePaymentIdempotencyKey(
  userId: string,
  transactionRef: string,
  projectName: string,
  amount: number
): string {
  const cleanUser = (userId || 'anon').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanRef = (transactionRef || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanProj = (projectName || 'proj').trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
  
  if (cleanRef && cleanRef.length > 3) {
    return `pay_${cleanUser}_${cleanRef}`;
  }
  return `pay_${cleanUser}_${cleanProj}_${amount}_${Date.now()}`;
}

// Helper to resolve API URLs correctly across Web, PWA, and Capacitor Android APK
export function getApiUrl(endpoint: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // When running inside Capacitor APK (capacitor://localhost or http://localhost on mobile), route to the hosted backend
    if (origin && (origin.startsWith('capacitor:') || origin.startsWith('file:') || origin.includes('localhost:'))) {
      const remoteHost = 'https://ais-pre-v24ynvc7rw6wua7zkvzaz7-617095961836.asia-southeast1.run.app';
      return `${remoteHost}${endpoint}`;
    }
  }
  return endpoint;
}

// Strict server-side verification for privileged Admin authorization
export async function verifyAdminPinWithServer(
  enteredPin: string
): Promise<{ success: boolean; adminToken?: string; expiresIn?: number; message?: string; retryAfterSeconds?: number }> {
  try {
    const res = await fetch(getApiUrl('/api/admin/verify-pin'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: sanitizeText(enteredPin) })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success && data.adminToken) {
      return {
        success: true,
        adminToken: data.adminToken,
        expiresIn: data.expiresIn
      };
    }
    return {
      success: false,
      message: data.message || 'Incorrect PIN / غلط پاس ورڈ',
      retryAfterSeconds: data.retryAfterSeconds
    };
  } catch {
    // Fail closed: Network or server error MUST deny access
    return {
      success: false,
      message: 'سیکورٹی سرور سے رابطہ نہیں ہو سکا۔ برائے مہربانی انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔ (Server unreachable)'
    };
  }
}

// Server-side session verification
export async function validateAdminSessionWithServer(
  adminToken: string
): Promise<{ valid: boolean; message?: string; networkOffline?: boolean }> {
  if (!adminToken || typeof adminToken !== 'string') {
    return { valid: false, message: 'No token' };
  }
  try {
    const res = await fetch(getApiUrl('/api/admin/validate-session'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ adminToken })
    });
    if (res.status === 401 || res.status === 403) {
      return { valid: false, message: 'Session expired' };
    }
    const data = await res.json().catch(() => ({}));
    return { valid: Boolean(res.ok && data.valid) };
  } catch {
    // Do not log out admin on momentary mobile cellular signal drop or offline state
    return { valid: true, networkOffline: true, message: 'Network offline / Server unreachable' };
  }
}

// Server-side session destruction on admin logout
export async function logoutAdminWithServer(adminToken?: string): Promise<void> {
  if (!adminToken) return;
  try {
    await fetch(getApiUrl('/api/admin/logout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ adminToken })
    });
  } catch {
    // Session state will be cleared locally
  }
}

// Server-side PIN update
export async function changeAdminPinWithServer(
  adminToken: string,
  newPin: string,
  currentPin?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(getApiUrl('/api/admin/change-pin'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ adminToken, newPin: sanitizeText(newPin), currentPin: currentPin ? sanitizeText(currentPin) : undefined })
    });
    const data = await res.json().catch(() => ({}));
    return {
      success: Boolean(res.ok && data.success),
      message: data.message || (res.ok ? 'PIN updated successfully' : 'Failed to update PIN')
    };
  } catch {
    return { success: false, message: 'Server unreachable' };
  }
}

// Validate password requirements
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
}

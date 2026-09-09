import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { UserActiveProject } from '../types';

export function getPlanTokenPrefix(projectId: string, startDate?: string): string {
  if (startDate) {
    const yearMatch = String(startDate).match(/\b(20\d\d)\b/);
    if (yearMatch) return `TK-${yearMatch[1]}`;
    const parsed = new Date(startDate);
    if (!isNaN(parsed.getFullYear()) && parsed.getFullYear() > 2000) {
      return `TK-${parsed.getFullYear()}`;
    }
  }
  return `TK-${new Date().getFullYear()}`;
}

export async function getNextMultipleUniqueTokens(
  projectId: string,
  count: number = 1,
  existingActiveProjects: UserActiveProject[] = [],
  startDate?: string
): Promise<Array<{ tokenNumber: number; tokenDisplay: string }>> {
  const safeCount = Math.max(1, count);
  const prefix = getPlanTokenPrefix(projectId, startDate);
  const counterDocRef = doc(db, 'token_counters', projectId);

  try {
    const allocatedNumbers = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterDocRef);
      let currentVal = 0;

      if (counterSnap.exists()) {
        const data = counterSnap.data();
        currentVal = typeof data.lastTokenNumber === 'number' ? data.lastTokenNumber : 0;
      } else {
        const matchingProjects = existingActiveProjects.filter(p => p.projectId === projectId);
        let maxExisting = 0;
        for (const p of matchingProjects) {
          const numMatch = String(p.ticketNumber || '').match(/(\d+)$/);
          if (numMatch) {
            const parsed = parseInt(numMatch[1], 10);
            if (!isNaN(parsed) && parsed > maxExisting) {
              maxExisting = parsed;
            }
          }
        }
        currentVal = maxExisting;
      }

      const results: number[] = [];
      for (let i = 1; i <= safeCount; i++) {
        results.push(currentVal + i);
      }
      const newLast = currentVal + safeCount;

      transaction.set(counterDocRef, {
        projectId,
        prefix,
        lastTokenNumber: newLast,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return results;
    });

    return allocatedNumbers.map(n => ({
      tokenNumber: n,
      tokenDisplay: `${prefix}-${String(n).padStart(3, '0')}`
    }));
  } catch (error) {
    console.warn('[tokenService] Firestore transaction failed for multiple tokens, falling back to local calculation:', error);
    const matchingProjects = existingActiveProjects.filter(p => p.projectId === projectId);
    let maxExisting = 0;
    for (const p of matchingProjects) {
      const numMatch = String(p.ticketNumber || '').match(/(\d+)$/);
      if (numMatch) {
        const parsed = parseInt(numMatch[1], 10);
        if (!isNaN(parsed) && parsed > maxExisting) {
          maxExisting = parsed;
        }
      }
    }
    const results: Array<{ tokenNumber: number; tokenDisplay: string }> = [];
    for (let i = 1; i <= safeCount; i++) {
      const num = maxExisting + i;
      results.push({
        tokenNumber: num,
        tokenDisplay: `${prefix}-${String(num).padStart(3, '0')}`
      });
    }
    return results;
  }
}

export async function getNextUniqueTokenNumber(
  projectId: string,
  existingActiveProjects: UserActiveProject[] = [],
  startDate?: string
): Promise<{ tokenNumber: number; tokenDisplay: string }> {
  const tokens = await getNextMultipleUniqueTokens(projectId, 1, existingActiveProjects, startDate);
  return tokens[0];
}

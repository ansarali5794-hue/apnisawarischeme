import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { UserActiveProject } from '../types';

export function getPlanTokenPrefix(projectId: string, startDate?: string): string {
  const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
  return `TK-${year}`;
}

export async function getNextUniqueTokenNumber(
  projectId: string,
  existingActiveProjects: UserActiveProject[] = [],
  startDate?: string
): Promise<{ tokenNumber: number; tokenDisplay: string }> {
  const prefix = getPlanTokenPrefix(projectId, startDate);
  const counterDocRef = doc(db, 'token_counters', projectId);

  try {
    const nextVal = await runTransaction(db, async (transaction) => {
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

      const nextNumber = currentVal + 1;
      transaction.set(counterDocRef, {
        projectId,
        prefix,
        lastTokenNumber: nextNumber,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return nextNumber;
    });

    const padded = String(nextVal).padStart(3, '0');
    return {
      tokenNumber: nextVal,
      tokenDisplay: `${prefix}-${padded}`
    };
  } catch (error) {
    console.warn('[tokenService] Firestore transaction failed, falling back to client-calculated token:', error);
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
    const nextVal = maxExisting + 1;
    const padded = String(nextVal).padStart(3, '0');
    return {
      tokenNumber: nextVal,
      tokenDisplay: `${prefix}-${padded}`
    };
  }
}

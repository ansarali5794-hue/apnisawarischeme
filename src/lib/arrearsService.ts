import { VehicleProject } from '../types';

export interface SchemeArrearsInfo {
  monthsPassed: number;          // full calendar months passed since startDate (e.g. 3)
  currentSchemeMonth: number;    // current active month of scheme (e.g. 4)
  unpaidMonths: number;          // how many months need to be paid (e.g. 4 if completedUnits=0)
  baseMonthlyKist: number;       // e.g. 5,000
  totalPayablePerToken: number;  // baseMonthlyKist * unpaidMonths (e.g. 20,000)
  isLateJoin: boolean;           // true if monthsPassed > 0
  overdueMonthsCount: number;    // past months passed before current month (e.g. 3)
}

/**
 * Accurately calculates overdue past months and total payable installments
 * for schemes that started in previous months.
 */
export function calculateSchemeArrears(
  project?: VehicleProject | null,
  completedUnits: number = 0
): SchemeArrearsInfo {
  const isOneTime = project?.projectType === 'one-time' || (project?.category === 'luckydraw' && (project?.durationMonths || 1) <= 6 && !project?.monthlyKist);
  const baseKist = isOneTime
    ? (project?.tokenPrice || project?.tokenAmount || 1000)
    : (project?.monthlyKist || project?.tokenPrice || 5000);

  // One-time schemes do not have monthly installments or arrears
  if (isOneTime || !project || !project.startDate) {
    return {
      monthsPassed: 0,
      currentSchemeMonth: 1,
      unpaidMonths: 1,
      baseMonthlyKist: baseKist,
      totalPayablePerToken: baseKist,
      isLateJoin: false,
      overdueMonthsCount: 0
    };
  }

  const start = new Date(project.startDate);
  const now = new Date();

  // Full calendar months elapsed from start date to current date
  let m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (m < 0) m = 0;

  const monthsPassed = m;
  const currentSchemeMonth = monthsPassed + 1;

  // Unpaid months: total elapsed months in scheme minus already completed/paid units
  const dueMonths = currentSchemeMonth - Math.max(0, completedUnits);
  const unpaidMonths = Math.max(1, dueMonths);
  const overdueMonthsCount = Math.max(0, unpaidMonths - 1);

  return {
    monthsPassed,
    currentSchemeMonth,
    unpaidMonths,
    baseMonthlyKist: baseKist,
    totalPayablePerToken: baseKist * unpaidMonths,
    isLateJoin: monthsPassed > 0,
    overdueMonthsCount
  };
}

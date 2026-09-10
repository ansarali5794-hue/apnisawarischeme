export type TabType = 'home' | 'projects' | 'project-detail' | 'payments' | 'luckydraw' | 'profile' | 'dashboard' | 'terms' | 'auth' | 'admin';

export interface VehicleProject {
  id: string;
  title: string;
  subtitle: string;
  category?: 'committee' | 'luckydraw' | string;
  projectType?: 'monthly' | 'one-time';
  vehicleType?: 'car' | 'bike' | 'ev' | string;
  durationMonths: number;
  monthlyKist?: number;
  installmentAmount?: number;
  tokenPrice?: number;
  tokenAmount?: number;
  totalMembers?: number;
  monthlyDrawPrize?: string;
  qurstandaziBenefit?: string;
  nonWinnersRefundText?: string;
  imageUrl: string;
  statusBadge?: 'OPEN' | 'FEW LEFT' | 'LIMITED SEATS' | 'CLOSED' | string;
  description?: string;
  startDate?: string;
  specs?: {
    engine?: string;
    mileage?: string;
    warranty?: string;
    transmission?: string;
    fuelCapacity?: string;
    colorOptions?: string[];
  };
  features?: string[];
}

export interface UserActiveProject {
  id: string;
  userId?: string;
  userName?: string;
  userToken?: string;
  projectId: string;
  projectTitle: string;
  projectType: string;
  imageUrl: string;
  monthlyKist?: number;
  tokenAmount?: number;
  nextDueOrDrawDate: string;
  completedUnits: number;
  totalUnits: number;
  ticketNumber: string;
  status: 'ACTIVE' | 'WON' | 'COMPLETED' | 'PENDING';
}

export type PaymentStatus = 'PAID' | 'UNDER_REVIEW' | 'PENDING' | 'REJECTED';

export interface PaymentRecord {
  id: string;
  userId?: string;
  projectId?: string;
  userToken?: string;
  userName?: string;
  projectName: string;
  installmentLabel: string;
  amount: number;
  date: string;
  transactionRef: string;
  paymentMethod: string;
  status: PaymentStatus;
  rejectReason?: string;
  receiptUrl?: string;
  receiptFileName?: string;
}

export interface BankAccountDetail {
  id: string;
  methodType: 'easypaisa' | 'jazzcash' | 'bank' | 'cash';
  title: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  branchOrIban?: string;
  instructions?: string;
  isActive: boolean;
}

export interface WinnerRecord {
  id: string;
  name: string;
  memberId: string;
  avatarUrl?: string;
  photoUrl?: string;
  city?: string;
  drawMonth?: string;
  prizeWon: string;
  date: string;
  ticketNumber?: string;
}

export interface UserProfile {
  uid?: string;
  id?: string;
  name: string;
  full_name?: string;
  memberId: string;
  email?: string;
  password?: string;
  phone?: string;
  phoneNumber?: string;
  phone_number?: string;
  cnic: string;
  fatherName?: string;
  city?: string;
  address?: string;
  avatarUrl: string;
  isLoggedIn?: boolean;
  role?: 'customer' | 'admin';
  account_status?: 'active' | 'pending' | 'rejected' | 'suspended' | 'frozen';
  resetPasswordRequested?: boolean;
  resetPasswordRequestedAt?: string;
  pendingNewPassword?: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  created_at?: string;
  activeTokensCount: number;
  totalPaidAmount: number;
  joinedDate?: string;
}

export interface RegistrationFormData {
  fullName: string;
  cnic: string;
  phone: string;
  email?: string;
  address: string;
  password: string;
  confirmPassword: string;
  avatarUrl?: string;
}

export interface TermSection {
  id?: string;
  number: string;
  title: string;
  paragraphs: string[];
  translations?: {
    en?: { title: string; paragraphs: string[] };
    ur?: { title: string; paragraphs: string[] };
    sd?: { title: string; paragraphs: string[] };
  };
}

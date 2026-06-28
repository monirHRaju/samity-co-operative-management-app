// ──── User & Auth ────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export type Role = "ADMIN" | "ACCOUNTANT" | "MEMBER";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ──── Members ────

export interface Member {
  id: string;
  userId: string;
  memberNo: string;
  fullName: string;
  phone: string;
  address?: string;
  nid?: string;
  occupation?: string;
  monthlyIncome?: number; // in paisa
  nomineName?: string;
  nomineNid?: string;
  nominePhone?: string;
  photoUrl?: string;
  isActive: boolean;
  joinedAt: string;
}

// ──── Savings ────

export interface SavingAccount {
  id: string;
  memberId: string;
  accountNo: string;
  balance: number; // in paisa
  goalAmount?: number;
  interestRate: number;
  status: AccountStatus;
  openedAt: string;
}

export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

// ──── Loans ────

export interface Loan {
  id: string;
  memberId: string;
  loanNo: string;
  type: LoanType;
  principalAmount: number;
  interestRate: number;
  totalPayable: number;
  paidAmount: number;
  dueAmount: number;
  installmentCount: number;
  installmentAmount: number;
  status: LoanStatus;
  applicationDate: string;
  dueDate: string;
}

export type LoanType = "GENERAL" | "EMERGENCY" | "BUSINESS" | "EDUCATION" | "HOME";
export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "DISBURSED"
  | "ACTIVE"
  | "CLOSED"
  | "DEFAULTED"
  | "REJECTED";

// ──── Investments ────

export interface Investment {
  id: string;
  memberId: string;
  amount: number;
  returnRate: number;
  durationMonths: number;
  maturityDate: string;
  status: InvestmentStatus;
  investedAt: string;
}

export type InvestmentStatus = "ACTIVE" | "MATURED" | "WITHDRAWN";

// ──── Ledger ────

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";

// ──── Pagination ────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ──── API Response ────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
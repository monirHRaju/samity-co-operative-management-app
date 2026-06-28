# Samity App — Cooperative Society Management System

## App Identity
- **Name:** Samity App
- **Purpose:** Cooperative savings, loan, and investment management system

## Tech Stack
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn/UI, Redux Toolkit, Recharts
- **Backend:** Express.js, TypeScript, Prisma ORM, PostgreSQL
- **Auth:** JWT access token (15min) + Refresh token (7d) via httpOnly cookie

## Money Convention
- ALL monetary amounts are stored as **INTEGER in PAISA** (1 taka = 100 paisa)
- Frontend always divides by 100 for display
- Never store floats for money — ever
- Display formatting: `(amount / 100).toFixed(2)` with currency symbol

## Timezone
- All timestamps stored in **UTC** in the database
- Display converted to **Asia/Dhaka** (GMT+6) on the frontend

## API Convention
- Base path: `/api/v1/`
- Every module follows: **Controller → Service → Repository** pattern
- Responses use the `response.helper.ts` utility for consistency

## Financial Transactions
- Every financial transaction **MUST** call `createJournalEntry()` from `server/src/utils/ledger.helper.ts`
- This ensures double-entry bookkeeping integrity

## RBAC Roles
| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access — everything |
| **ACCOUNTANT** | No user management, no settings access |
| **MEMBER** | Own data read-only |

## Directory Structure
```
samity-app/
├── CLAUDE.md
├── client/          ← Next.js 14 frontend
├── server/          ← Express.js + Prisma backend
└── package.json     ← Root workspace scripts
```

## Chart of Accounts Reference

| Account Code | Account Name        | Type       |
|--------------|---------------------|------------|
| 1000         | Cash In Hand        | Asset      |
| 1100         | Bank Account        | Asset      |
| 1200         | Loan Receivable     | Asset      |
| 1300         | Investments         | Asset      |
| 1400         | Other Assets        | Asset      |
| 2000         | Accounts Payable    | Liability  |
| 2100         | Savings Liability   | Liability  |
| 2200         | Loan Liability      | Liability  |
| 2300         | Other Liabilities   | Liability  |
| 3000         | Share Capital       | Equity     |
| 3100         | Retained Earnings   | Equity     |
| 4000         | Interest Income     | Revenue    |
| 4100         | Fee Income          | Revenue    |
| 5000         | Interest Expense    | Expense    |
| 5100         | Operational Expense | Expense    |
| 5200         | Provision for Loan Losses | Expense |

*Note: Adjust codes and names as per your country's accounting standards.*

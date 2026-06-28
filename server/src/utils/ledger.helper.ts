import { PrismaClient } from '@prisma/client';

/**
 * Double-entry ledger helper.
 * Every financial transaction MUST call this function to ensure
 * that journal entries are recorded for audit trail integrity.
 *
 * At minimum, call with one debit and one credit entry per transaction.
 */
interface JournalEntryInput {
  accountId: string;
  debitAmount?: number;
  creditAmount?: number;
  memberId?: string;
  savingId?: string;
  loanId?: string;
  description?: string;
  reference?: string;
}

export async function createJournalEntry(
  prisma: PrismaClient,
  entries: JournalEntryInput[],
  description?: string
): Promise<void> {
  const voucherNo = `V-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const totalDebit = entries.reduce((sum, e) => sum + (e.debitAmount || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.creditAmount || 0), 0);

  if (totalDebit !== totalCredit) {
    throw new Error(`Journal entry unbalanced: debit ${totalDebit} ≠ credit ${totalCredit}`);
  }

  await prisma.journalEntry.createMany({
    data: entries.map((entry) => ({
      voucherNo,
      accountId: entry.accountId,
      memberId: entry.memberId || null,
      savingId: entry.savingId || null,
      loanId: entry.loanId || null,
      debitAmount: entry.debitAmount || 0,
      creditAmount: entry.creditAmount || 0,
      description: entry.description || description || null,
      reference: entry.reference || null,
    })),
  });
}
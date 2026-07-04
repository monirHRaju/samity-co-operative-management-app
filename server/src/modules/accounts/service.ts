import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';
import { responseHelper } from '@/utils/response.helper';

export class AccountsService {
  async getAllAccounts() {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return responseHelper.success(accounts);
  }

  async getAccountById(id: string) {
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account) {
      return responseHelper.notFound('Account not found');
    }
    return responseHelper.success(account);
  }

  // TODO: createAccount, updateAccount, toggleAccountStatus, deposit, withdrawal, transfer, getAccountLedger, getAccountsSummary
}

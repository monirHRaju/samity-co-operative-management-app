import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const salt = await bcrypt.genSalt(10)
  const adminPassword = await bcrypt.hash('Admin@1234', salt)
  const accountantPassword = await bcrypt.hash('Password@123', salt)

  // Create users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@samity.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  const accountantUser = await prisma.user.create({
    data: {
      name: 'Accountant User',
      email: 'accountant@samity.com',
      password: accountantPassword,
      role: 'ACCOUNTANT',
      isActive: true,
    },
  })

  // Create default accounts
  const cashAccount = await prisma.account.create({
    data: {
      name: 'Hand Cash',
      type: 'CASH',
      currentBalance: 0,
      isActive: true,
    },
  })

  const bankAccount = await prisma.account.create({
    data: {
      name: 'Main Bank',
      type: 'BANK',
      currentBalance: 0,
      isActive: true,
    },
  })

  console.log('Created admin user:', adminUser.email)
  console.log('Created accountant user:', accountantUser.email)
  console.log('Created cash account:', cashAccount.name)
  console.log('Created bank account:', bankAccount.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
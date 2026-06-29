import { prisma } from '@/utils/prisma';
import { Prisma, MemberStatus, MemberSaving } from '@prisma/client';
import { z } from 'zod';

/**
 * Validation schema for creating a member
 */
const createMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  fatherName: z.string().min(1, "Father's name is required"),
  phone: z.string().min(10, 'Phone number is required').regex(/^[0-9]+$/, 'Phone must contain only digits'),
  address: z.string().min(1, 'Address is required'),
  nidNumber: z.string().min(1, 'NID number is required').regex(/^[0-9]+$/, 'NID must contain only digits'),
  joinDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid join date' }),
  nomineeName: z.string().min(1, 'Nominee name is required'),
  nomineePhone: z.string().min(10, "Nominee's phone is required").regex(/^[0-9]+$/, 'Phone must contain only digits'),
  nomineeRelation: z.string().min(1, 'Nominee relation is required'),
  motherName: z.string().optional(),
  photo: z.string().url('Photo must be a valid URL').optional(),
});

/**
 * Validation schema for updating a member (partial)
 */
const updateMemberSchema = createMemberSchema.partial();

export class MembersService {
  /**
   * Generate next member number in format M-0001, M-0002, etc.
   */
  private async generateMemberNo(): Promise<string> {
    // Find the highest existing member number
    const lastMember = await prisma.member.findFirst({
      orderBy: { memberNo: 'desc' },
      select: { memberNo: true },
    });

    if (!lastMember) {
      return 'M-0001';
    }

    // Extract numeric part from format M-0001
    const match = lastMember.memberNo.match(/M-(\d+)/);
    if (!match) {
      // Fallback: start from 0001
      return 'M-0001';
    }

    const num = parseInt(match[1], 10) + 1;
    // Pad with zeros to length 4
    const padded = String(num).padStart(4, '0');
    return `M-${padded}`;
  }

  /**
   * Get all members with pagination, search, and status filter
   */
  async getAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: MemberStatus;
  }) {
    const page = Math.max(parseInt(String(query.page ?? 1)), 1);
    const limit = Math.max(parseInt(String(query.limit ?? 20)), 1);
    const skip = (page - 1) * limit;

    const where: Prisma.MemberWhereInput = {};

    if (query.search) {
      const searchTerm = query.search.trim();
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
          { nidNumber: { contains: searchTerm } },
          { memberNo: { contains: searchTerm } },
        ];
      }
    }

    if (query.status) {
      where.status = query.status;
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          memberNo: true,
          name: true,
          fatherName: true,
          motherName: true,
          phone: true,
          address: true,
          nidNumber: true,
          photo: true,
          joinDate: true,
          status: true,
          nomineeName: true,
          nomineePhone: true,
          nomineeRelation: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return {
      data: members,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get member by ID with savings summary
   */
  async findById(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        memberNo: true,
        name: true,
        fatherName: true,
        motherName: true,
        phone: true,
        address: true,
        nidNumber: true,
        photo: true,
        joinDate: true,
        status: true,
        nomineeName: true,
        nomineePhone: true,
        nomineeRelation: true,
        createdAt: true,
        updatedAt: true,
        // Include savings summary
        savings: {
          select: {
            amount: true,
          },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Calculate total savings
    const totalSavings = member.savings.reduce((sum, s) => sum + s.amount, 0);

    return {
      ...member,
      totalSavings,
      savings: undefined, // Remove raw savings array from response; we only need summary
    };
  }

  /**
   * Create a new member
   */
  async create(data: unknown) {
    // Validate input
    const result = createMemberSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.errors.map((e) => e.message).join(', '));
    }
    const validatedData = result.data;

    // Check uniqueness of phone and nid
    const [phoneExists, nidExists] = await Promise.all([
      prisma.member.findUnique({ where: { phone: validatedData.phone } }),
      prisma.member.findUnique({ where: { nidNumber: validatedData.nidNumber } }),
    ]);

    if (phoneExists) {
      throw new Error('Phone number already exists');
    }
    if (nidExists) {
      throw new Error('NID number already exists');
    }

    // Generate member number
    const memberNo = await this.generateMemberNo();

    // Convert joinDate string to Date
    const joinDate = new Date(validatedData.joinDate);

    // Create member
    const member = await prisma.member.create({
      data: {
        memberNo,
        name: validatedData.name,
        fatherName: validatedData.fatherName,
        motherName: validatedData.motherName ?? null,
        phone: validatedData.phone,
        address: validatedData.address,
        nidNumber: validatedData.nidNumber,
        photo: validatedData.photo ?? null,
        joinDate,
        nomineeName: validatedData.nomineeName,
        nomineePhone: validatedData.nomineePhone,
        nomineeRelation: validatedData.nomineeRelation,
        status: MemberStatus.ACTIVE, // default active
      },
      select: {
        id: true,
        memberNo: true,
        name: true,
        fatherName: true,
        motherName: true,
        phone: true,
        address: true,
        nidNumber: true,
        photo: true,
        joinDate: true,
        status: true,
        nomineeName: true,
        nomineePhone: true,
        nomineeRelation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return member;
  }

  /**
   * Update member by ID
   */
  async update(id: string, data: unknown) {
    // Check if member exists
    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Member not found');
    }

    // Validate input (partial)
    const result = updateMemberSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.errors.map((e) => e.message).join(', '));
    }
    const validatedData = result.data;

    // Check uniqueness if phone or nid is being updated
    if (validatedData.phone) {
      const phoneExists = await prisma.member.findFirst({
        where: {
          phone: validatedData.phone,
          NOT: { id },
        },
      });
      if (phoneExists) {
        throw new Error('Phone number already exists');
      }
    }
    if (validatedData.nidNumber) {
      const nidExists = await prisma.member.findFirst({
        where: {
          nidNumber: validatedData.nidNumber,
          NOT: { id },
        },
      });
      if (nidExists) {
        throw new Error('NID number already exists');
      }
    }

    // Convert joinDate if provided
    const updateData: Prisma.MemberUpdateInput = { ...validatedData };
    if (validatedData.joinDate) {
      updateData.joinDate = new Date(validatedData.joinDate);
    }

    // Update member
    const member = await prisma.member.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        memberNo: true,
        name: true,
        fatherName: true,
        motherName: true,
        phone: true,
        address: true,
        nidNumber: true,
        photo: true,
        joinDate: true,
        status: true,
        nomineeName: true,
        nomineePhone: true,
        nomineeRelation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return member;
  }

  /**
   * Delete member (soft delete by setting status to INACTIVE)
   * Actually spec says toggle-status endpoint; we can implement delete as setting inactive
   */
  async delete(id: string) {
    return this.toggleStatus(id); // reuse toggle to set inactive
  }

  /**
   * Toggle member status (active/inactive)
   */
  async toggleStatus(id: string) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new Error('Member not found');
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        status: member.status === MemberStatus.ACTIVE ? MemberStatus.INACTIVE : MemberStatus.ACTIVE,
      },
      select: {
        id: true,
        memberNo: true,
        name: true,
        status: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Get member's savings statement (full history with totals)
   */
  async getStatement(id: string) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        savings: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Calculate totals
    const totalDeposits = member.savings.reduce((sum, s) => sum + s.amount, 0);
    // Assuming savings are only deposits; if there were withdrawals we'd need a separate field
    // For now, net savings = total deposits
    const totalWithdrawals = 0; // placeholder
    const netSavings = totalDeposits - totalWithdrawals;

    return {
      member: {
        id: member.id,
        memberNo: member.memberNo,
        name: member.name,
        fatherName: member.fatherName,
        motherName: member.motherName,
        phone: member.phone,
        address: member.address,
        nidNumber: member.nidNumber,
        photo: member.photo,
        joinDate: member.joinDate,
        status: member.status,
        nomineeName: member.nomineeName,
        nomineePhone: member.nomineePhone,
        nomineeRelation: member.nomineeRelation,
      },
      savings: member.savings.map((s) => ({
        id: s.id,
        amount: s.amount,
        month: s.month,
        year: s.year,
        note: s.note,
        collectedAt: s.collectedAt,
      })),
      totals: {
        totalDeposits,
        totalWithdrawals,
        netSavings,
      },
    };
  }
}
import { prisma } from "@/utils/prisma";
import * as bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export class UsersService {
  /**
   * Get all users (excluding password)
   */
  async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        memberId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new user
   */
  async create(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    isActive?: boolean;
  }) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user (excluding password and email)
   */
  async update(
    id: string,
    data: {
      name?: string;
      role?: Role;
      isActive?: boolean;
    },
  ) {
    // Ensure user exists
    const existing = await prisma.user.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new Error("User not found");
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Toggle user active status
   */
  async toggleStatus(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async delete(id: string) {
    return this.toggleStatus(id);
  }
}

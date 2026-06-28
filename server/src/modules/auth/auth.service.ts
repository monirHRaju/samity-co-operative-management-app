import { prisma } from '@/utils/prisma';
import * as bcrypt from 'bcryptjs';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'ACCOUNTANT' | 'MEMBER';
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
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
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Login user
   */
  async login(email: string, password: string, req: Request) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Hash refresh token and store in user record
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
        lastLogin: new Date(),
      },
    });

    // Set refresh token as HTTP-only cookie (will be set in controller)
    // Return access token and user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken, // In real app, send as cookie; here we return for simplicity (but should be httpOnly cookie)
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Find user by id from token
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Compare stored refresh token hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken || '');
    if (!isValid) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(user);

    return {
      accessToken: newAccessToken,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string) {
    // Clear refresh token
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
      },
    });
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Generate access token
   */
  private generateAccessToken(user: any) {
    return sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken() {
    return sign(
      {
        // We'll store a random jti to identify the token
        jti: Math.random().toString(36).substring(2),
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }
}

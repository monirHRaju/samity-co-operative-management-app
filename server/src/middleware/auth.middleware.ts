import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access-secret";

export interface AuthPayload {
  id?: string;
  userId?: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
    const userId = typeof decoded.sub === "string" ? decoded.sub : undefined;

    req.user = {
      id: userId,
      userId,
      email: typeof decoded.email === "string" ? decoded.email : "",
      role: typeof decoded.role === "string" ? decoded.role : "MEMBER",
    };

    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

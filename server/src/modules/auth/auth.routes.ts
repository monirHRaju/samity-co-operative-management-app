import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "@/middleware/auth.middleware";
import { requireRole } from "@/middleware/rbac.middleware";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

// Protected routes (require valid access token)
router.use(authenticate);

// Refresh token route (requires refresh token cookie)
router.post("/refresh-token", authController.refreshToken.bind(authController));

// Logout (requires access token to identify user)
router.post("/logout", authController.logout.bind(authController));

// Get profile
router.get("/me", authController.profile.bind(authController));

export default router;

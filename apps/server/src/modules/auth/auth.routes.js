import { Router } from "express";
import { register, login, refresh, logout } from "./auth.controller.js";
import { validateRegister, validateLogin } from "./auth.validators.js";
import { authLimiter } from "../../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;

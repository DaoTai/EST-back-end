import express from "express";
import AuthController from "../app/controllers/Auth.controller";

const router = express.Router();
router.post("/sign-up", AuthController.signUp);
router.post("/sign-in", AuthController.signIn);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/exist-email-and-provider", AuthController.checkExistEmailAndProvider);
router.post("/forgot-password", AuthController.getNewPassword);
router.post("/refresh-token", AuthController.refreshToken);

export default router;

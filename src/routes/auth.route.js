import express from "express";
import AuthController from "../app/controllers/Auth.controller";
const router = express.Router();
router.post("/sign-up", AuthController.signUp);
router.post("/sign-in", AuthController.signIn);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/check-exist", AuthController.checkExistEmailAndProvider);

export default router;

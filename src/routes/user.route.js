import express from "express";
import UserController from "../app/controllers/User.controller";

const router = express.Router();
router.post("/profile/edit", UserController.editProfile);

export default router;

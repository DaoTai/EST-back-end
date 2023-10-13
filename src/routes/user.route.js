import express from "express";
import UserController from "~/app/controllers/User.controller";
import { uploadImage } from "~/utils/multer";

const router = express.Router();
router.get("/profile", UserController.searchProfile);
router.get("/profile/:id", UserController.getProfile);
router.patch("/profile", uploadImage.single("avatar"), UserController.editProfile);
router.patch("/change-password", UserController.changePassword);
export default router;

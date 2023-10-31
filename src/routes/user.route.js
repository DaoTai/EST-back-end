import express from "express";
import UserController from "~/app/controllers/User.controller";
import { uploadImage } from "~/utils/multer";

const router = express.Router();
router.get("/profile", UserController.searchProfile);
router.patch("/profile", uploadImage.single("avatar"), UserController.editProfile);
router.get("/profile/:id", UserController.getProfile);
router.patch("/change-password", UserController.changePassword);
router.get("/courses", UserController.getOwnerCourses);
router.post("/courses/:id", UserController.registerCourse);
export default router;

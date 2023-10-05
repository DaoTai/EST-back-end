import express from "express";
import UserController from "~/app/controllers/User.controller";
import { upload } from "~/utils/multer";

//

const router = express.Router();
router.get("/profile/:id", UserController.getProfile);
router.patch("/profile/edit", upload.single("avatar"), UserController.editProfile);
router.patch("/change-password", UserController.changePassword);
export default router;

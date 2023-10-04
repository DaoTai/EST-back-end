import express from "express";
import UserController from "~/app/controllers/User.controller";
import { upload } from "~/services/multer";

//

const router = express.Router();
router.get("/profile/:id", UserController.getProfile);
router.patch("/profile/edit", upload.single("avatar"), UserController.editProfile);

export default router;

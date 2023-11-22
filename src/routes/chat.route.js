import { Router } from "express";
import ChatController from "~/app/controllers/Chat.controller";
import { uploadImage } from "~/utils/multer";
const router = Router();
router
  .route("/group-chat/:idGroupChat")
  .get(ChatController.getByGroupChat)
  .post(uploadImage.array("images"), ChatController.create);

router.route("/:id").patch(ChatController.seen).delete(ChatController.delete);

export default router;

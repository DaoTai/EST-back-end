import { Router } from "express";
import GroupChatController from "~/app/controllers/GroupChat.controller";
import verifyHost from "~/app/middlewares/verifyHost.middleware";

const router = Router();

router.route("/").get(GroupChatController.get).post(GroupChatController.createByUser);

router.delete("/:id/cancel", GroupChatController.cancel);

router.post("/:id/members", verifyHost, GroupChatController.addMembers);

router
  .route("/:id/members/:idMember")
  .patch(verifyHost, GroupChatController.handleStatusBlockMember)
  .delete(verifyHost, GroupChatController.deleteMember);

router
  .route("/:id")
  .get(GroupChatController.getDetail)
  .patch(GroupChatController.edit) // Edit basic: change name, update latest message
  .delete(verifyHost, GroupChatController.delete);

export default router;

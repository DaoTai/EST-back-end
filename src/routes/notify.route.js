import { Router } from "express";
import NotificationController from "~/app/controllers/Notification.controller";

const router = Router();

router.route("/user").get(NotificationController.getByUser).patch(NotificationController.read);

export default router;

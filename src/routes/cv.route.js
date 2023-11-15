import { Router } from "express";
import CVController from "~/app/controllers/CV.controller";

const router = Router();

router.route("/").get(CVController.getList).post(CVController.create);
router.get("/byUser", CVController.getByUser);
router.route("/:id").get(CVController.get).put(CVController.edit).delete(CVController.delete);

export default router;

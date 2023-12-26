import { Router } from "express";
import VisitorController from "~/app/controllers/Visitor.controller";
const router = Router();

router.get("/search/courses", VisitorController.searchCourse);
router.get("/search/courses/:slug", VisitorController.getCourse);
router.get("/overview-infor", VisitorController.getOverViewInfor);

export default router;

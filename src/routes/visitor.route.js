import { Router } from "express";
import VisitorController from "~/app/controllers/Visitor.controller";
const router = Router();

router.get("/search/courses", VisitorController.searchCourse);
router.get("/search/courses/:slug", VisitorController.getCourse);

export default router;

import { Router } from "express";
import CourseController from "~/app/controllers/Course.controller";
import { uploadDocument } from "~/utils/multer";

const uploadFiles = uploadDocument.fields([
  {
    name: "thumbnail",
    maxCount: 1,
  },
  {
    name: "roadmap",
    maxCount: 1,
  },
]);

const router = Router();
router.route("/").get(CourseController.getOwner).post(uploadFiles, CourseController.create);
router.get("/trashes", CourseController.getOwnerTrashes);
router
  .route("/:id")
  .get(CourseController.get)
  .patch(uploadFiles, CourseController.edit)
  .delete(CourseController.delete);

router.patch("/:id/restore", CourseController.restore);
router.delete("/:id/destroy", CourseController.destroy);

export default router;

import { Router } from "express";
import CourseController from "~/app/controllers/Course.controller";
import { uploadDocument, uploadImage } from "~/utils/multer";

const uploadFiles = uploadImage.fields([
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
  .post(CourseController.appendMember)
  .patch(uploadFiles, CourseController.edit)
  .delete(CourseController.delete);

router.patch("/:id/restore", CourseController.restore);
router.delete("/:id/destroy", CourseController.destroy);
router.get("/:id/avg-scores", CourseController.getAvgScores);

export default router;

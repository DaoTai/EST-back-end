import { Router } from "express";
import QuestionController from "~/app/controllers/Question.controller";
import { validateQuestionData } from "~/app/middlewares/validation.middleware";
const router = Router();

router
  .route("/detail/:id")
  .get(QuestionController.getById)
  .patch(validateQuestionData, QuestionController.edit)
  .delete(QuestionController.delete);
router
  .route("/:idLesson")
  .get(QuestionController.getByIdLesson)
  .post(validateQuestionData, QuestionController.createByIdLesson);

export default router;

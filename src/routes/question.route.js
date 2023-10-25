import { Router } from "express";
import QuestionController from "~/app/controllers/Question.controller";
import { QUESTIONS_CATEGORIES } from "~/utils/constants";
const router = Router();

const validateQuestionData = async (req, res, next) => {
  try {
    const data = req.body;
    if (data?.category) {
      if (!QUESTIONS_CATEGORIES.includes(data?.category))
        return res.status(400).json("Category is invalid");

      const lengthCorrects = data?.correctAnswers?.length;
      if (data?.correctAnswers) {
        // Thể loại  === 'code' mà lại có answer
        if (data?.category === "code")
          return res.status(400).json("Code category can not be haved any answers");
        // Thể loại  === 'choice' mà answer nhiều hơn 1
        if (data?.category === "choice" && lengthCorrects > 1)
          return res.status(400).json("Choice category must be only had one choice");

        // Thể loại  === 'multiple-choice' mà answer ít hơn 2
        if (data?.category === "multiple-choice" && lengthCorrects < 2)
          return res
            .status(400)
            .json("Multiple-choice category must be had more than 1 correct answer");
        return next();
      } else {
        if (data?.category === "code") return next();
        return res.status(400).json("Choice or multiple-choice must be had correct answers");
      }
    }
    return res.status(400).json("Category is required");
  } catch (error) {
    next(error);
  }
};

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

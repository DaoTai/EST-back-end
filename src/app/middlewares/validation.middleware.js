// Validate Question route
import { QUESTIONS_CATEGORIES } from "~/utils/constants";

export const validateQuestionData = async (req, res, next) => {
  try {
    const data = req.body;
    if (data?.category) {
      if (!QUESTIONS_CATEGORIES.includes(data?.category))
        return res.status(400).json("Category is invalid");
      const lengthCorrects = data?.correctAnswers?.length;
      if (data?.answers && data?.correctAnswers) {
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
        if (!data?.answers) {
          return res.status(400).json("Choice or multiple-choice must have at least one answer");
        }
        return res.status(400).json("Choice or multiple-choice must be had correct answers");
      }
    }
    return res.status(400).json("Category is required");
  } catch (error) {
    next(error);
  }
};

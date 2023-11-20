import {
  getListAnswerRecordByIdQuestion,
  giveScoreCodeQuestion,
} from "~/services/Question.service";

class AnswerRecordController {
  // [GET] /answer-records/by-lesson/:idQuestion
  async getAnswerRecords(req, res, next) {
    try {
      const idQuestion = req.params.idQuestion;
      if (!idQuestion) return res.status(400).json("Id question is required");
      const listAnswers = await getListAnswerRecordByIdQuestion(idQuestion);
      return res.status(200).json(listAnswers);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /answer-records/:id
  async updateAnswerRecord(req, res, next) {
    try {
      const idAnswerRecord = req.params.id;
      const { score, comment } = req.body;
      if (!idAnswerRecord) return res.status(400).json("Id answer record is required");
      await giveScoreCodeQuestion({
        idAnswerRecord,
        score,
        comment,
      });
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}

export default new AnswerRecordController();

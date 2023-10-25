import {
  createQuestionByIdLesson,
  deleteQuestion,
  getQuestionById,
  getQuestionsByIdLesson,
  editQuestion,
} from "~/services/Question.service";

class QuestionController {
  // [GET] /questions/:idLesson
  async getByIdLesson(req, res, next) {
    try {
      const questions = await getQuestionsByIdLesson(req.params.idLesson);
      return res.status(200).json(questions);
    } catch (error) {
      next(error);
    }
  }

  // [POST] /questions:idLesson
  async createByIdLesson(req, res, next) {
    try {
      const newLesson = await createQuestionByIdLesson(req.params.idLesson, req.body);
      return res.status(201).json(newLesson);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /questions/detail/:id
  async getById(req, res, next) {
    try {
      const question = await getQuestionById(req.params.id);
      return res.status(200).json(question);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /questions/detail/:id
  async edit(req, res, next) {
    try {
      const question = await editQuestion(req.params.id, req.body);
      return res.status(200).json(question);
    } catch (error) {
      next(error);
    }
  }

  //   [DELETE] /questions/detail/:id
  async delete(req, res, next) {
    try {
      await deleteQuestion(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new QuestionController();

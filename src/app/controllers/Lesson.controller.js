import {
  getLessonsByIdCourse,
  createLesson,
  editLesson,
  deleteLesson,
  getLessonById,
} from "~/services/Lesson.service";
import { sendNotifyToMembersInCourse } from "~/services/Notification.service";

class LessonController {
  // [GET] /lessons/:idCourse
  async getByIdCourse(req, res, next) {
    try {
      const page = +req.query.page || 1;
      const result = await getLessonsByIdCourse({
        idCourse: req.params.idCourse,
        currentPage: page,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [POST] /lessons/:idCourse
  async create(req, res, next) {
    try {
      const newLesson = await createLesson(req.params.idCourse, req.body, req.file);
      await sendNotifyToMembersInCourse({
        idUser: req.user._id,
        lesson: newLesson,
      });
      return res.status(201).json(newLesson.getInfor());
    } catch (error) {
      next(error);
    }
  }

  // [GET] /lessons/detail/:id
  async getById(req, res, next) {
    try {
      const lesson = await getLessonById(req.params.id);
      return res.status(200).json(lesson);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /lessons/detail/:id
  async edit(req, res, next) {
    try {
      const lesson = await editLesson(req.params.id, req.body, req.file);
      return res.status(200).json(lesson ? lesson.getInfor() : lesson);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /lessons/detail/:id
  async delete(req, res, next) {
    try {
      await deleteLesson(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new LessonController();

import {
  createCourse,
  destroyCourse,
  editCourse,
  getCourseById,
  restoreCourse,
  searchCourse,
  softDeleteCourse,
} from "~/services/Course.service";
class CourseController {
  // Only my courses
  // [GET] courses
  async search(req, res, next) {
    try {
      const result = await searchCourse(req.query, req.user._id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [POST] courses
  async create(req, res, next) {
    try {
      const result = await createCourse(req.body, req.user._id);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [GET] courses/:id
  async get(req, res, next) {
    try {
      const course = await getCourseById(req.params.id, req.user._id);
      return res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] courses/:id
  async edit(req, res, next) {
    try {
      const result = await editCourse(req.body, req.params.id, req.user._id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] courses/:id
  async delete(req, res, next) {
    try {
      await softDeleteCourse(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] courses/:id/restore
  async restore(req, res, next) {
    try {
      restoreCourse(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] courses/:id/destroy
  async destroy(req, res, next) {
    try {
      await destroyCourse(req.params.id, req.user._id, req.user.roles);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();

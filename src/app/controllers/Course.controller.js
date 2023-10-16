import {
  createCourse,
  destroyCourse,
  editCourse,
  getCourseById,
  restoreCourse,
  getOwnerCourses,
  softDeleteCourse,
  getTrashedCourses,
} from "~/services/Course.service";
class CourseController {
  // Only my courses
  // [GET] courses
  async getOwner(req, res, next) {
    try {
      const result = await getOwnerCourses(req.user._id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [GET] trashes
  async getOwnerTrashes(req, res, next) {
    try {
      const result = await getTrashedCourses(req.user._id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [POST] courses
  async create(req, res, next) {
    try {
      const newCourse = await createCourse(req.body, req.user._id, req.files);
      return res.status(201).json(newCourse.getInfor());
    } catch (error) {
      next(error);
    }
  }

  // [GET] courses/:id
  async get(req, res, next) {
    try {
      const course = await getCourseById(req.params.id, req.user._id);
      return res.status(200).json(course ? course.getInfor() : course);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] courses/:id
  async edit(req, res, next) {
    try {
      const result = await editCourse(req.body, req.params.id, req.user._id, req.files);
      return res.status(200).json(result ? result.getInfor() : course);
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
      console.log("hello");
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

import {
  approveCourses,
  destroyCourse,
  destroyCourseByAdmin,
  getListCoursesByAdmin,
  softDeleteCourse,
  toggleApproveCourse,
} from "~/services/Course.service";

class AdminController {
  // [GET] /admin/courses
  async getCoures(req, res, next) {
    try {
      const { name, status, page } = req.query;
      const currentPage = +page || 1;
      const perPage = 10;
      const condition = {};
      if (status) condition.status = status;
      if (name) condition.name = new RegExp(name, "i");
      const { courses, maxPage, total } = await getListCoursesByAdmin({
        condition,
        currentPage,
        perPage,
      });
      return res.status(200).json({ courses, maxPage, total });
    } catch (error) {
      next(error);
    }
  }

  //   [PATCH] /admin/courses
  async approveCourses(req, res, next) {
    try {
      const listIdCourses = req.body.listIds;
      console.log(listIdCourses);
      if (!Array.isArray(listIdCourses)) {
        return res.status(400).json("List courses are invalid");
      }
      await approveCourses(listIdCourses);
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  //   [PATCH] /admin/courses:id
  async toggleApproveCourse(req, res, next) {
    try {
      if (!req.params.id) return res.status(400).json("No exist id course");
      await toggleApproveCourse(req.params.id);
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  //  [DELETE] /admin/courses:id
  async deleteCourse(req, res, next) {
    try {
      if (!req.params.id) return res.status(400).json("No exist id course");
      console.log(req.params.id);
      await destroyCourseByAdmin(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();

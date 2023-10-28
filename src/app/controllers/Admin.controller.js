import { approveCourses, getListCoursesByAdmin } from "~/services/Course.service";

class AdminController {
  // [GET] /admin/courses
  async getCoures(req, res, next) {
    try {
      const { name, status } = req.query;
      const condition = {};
      if (status) condition.status = status;
      if (name) condition.name = new RegExp(name, "i");
      const data = await getListCoursesByAdmin(condition);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  //   [PATCH] /admin/courses
  async approveCourses(req, res, next) {
    try {
      const listIdCourses = req.body.listIds;

      if (!Array.isArray(listIdCourses)) {
        return res.status(400).json("List courses are invalid");
      }
      await approveCourses(listIdCourses);
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();

import { getDetailCourse, searchCourses } from "~/services/Course.service";
import Course from "../models/Course.model";

class VisitorController {
  // [GET] search/courses
  async searchCourse(req, res, next) {
    try {
      const { page, name, category, level, type } = req.query;
      const perPage = 2;
      const currentPage = +page || 1;

      // Only approved courses
      const condition = {
        status: "approved",
      };
      if (level) condition.level = level;
      if (type) condition.type = type;
      if (name) condition.name = new RegExp(name, "i");
      if (category) condition.category = new RegExp(category, "i");

      const result = await searchCourses({
        perPage,
        currentPage,
        condition,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [GET] search/courses/:slug
  // Only search approved courses
  async getCourse(req, res, next) {
    try {
      const slug = req.params.slug;
      const course = await getDetailCourse(slug);
      return res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }
}

export default new VisitorController();

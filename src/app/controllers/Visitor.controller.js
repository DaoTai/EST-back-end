import { getDetailCourseBySlug, searchCourses } from "~/services/Course.service";

class VisitorController {
  // [GET] search/courses
  async searchCourse(req, res, next) {
    try {
      const { page, name, language, level, type } = req.query;
      const currentPage = +page || 1;

      // Only approved courses
      const condition = {
        status: "approved",
        deleted: false,
      };
      if (level) condition.level = level;
      if (type) condition.type = type;
      if (name) condition.name = new RegExp(name, "i");
      if (language) condition.programmingLanguages = { $in: [language] };

      const result = await searchCourses({
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
      const result = await getDetailCourseBySlug(slug);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new VisitorController();

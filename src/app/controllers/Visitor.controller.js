import Course from "../models/Course.model";

class VisitorController {
  // [GET] search/courses
  async searchCourse(req, res, next) {
    try {
      const { page, name, category } = req.query;
      const perPage = 10;
      const currentPage = +page || 1;

      // Only approved courses
      const condition = {
        // status: "approved",
      };
      if (name) condition.name = new RegExp(name, "i");
      if (category) condition.category = new RegExp(category, "i");
      const courses = await Course.find(condition, {
        status: 0,
      })
        .skip(currentPage * perPage - perPage)
        .limit(perPage);
      const totalCourses = await Course.count(condition);

      return res
        .status(200)
        .json({ courses, maxPage: Math.ceil(totalCourses / perPage), total: totalCourses });
    } catch (error) {
      next(error);
    }
  }

  // [GET] search/courses/:slug
  // Only search approved courses
  async getCourse(req, res, next) {
    try {
      const slug = req.params.slug;
      const course = await Course.findOne({
        slug: slug,
        status: "approved",
      });
      return res.status(200).json(course ? course.getPreview() : course);
    } catch (error) {
      next(error);
    }
  }
}

export default new VisitorController();

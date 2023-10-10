import Course from "../models/Course.model";
class CourseController {
  // [GET] courses
  async searchCourse(req, res, next) {
    try {
      const { page, name, category } = req.query;
      const perPage = 10;
      const currentPage = +page || 1;
      const condition = {};
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

  // [POST] courses
  async createCourse(req, res, next) {
    try {
      const newCourse = new Course(req.body);
      newCourse.createdBy = req.user._id;
      const savedCourse = await newCourse.save();
      return res.status(201).json(savedCourse);
    } catch (error) {
      next(error);
    }
  }

  // [GET] courses/:id
  async getCourse(req, res, next) {
    try {
      const idCourse = req.params;
      const course = await Course.findById(idCourse);
      return res.status(200).json(course ? course.getPreview() : course);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] courses/:id
  async editCourse(req, res, next) {
    try {
      const idCourse = req.params;
      const data = req.body;
      await Course.findByIdAndUpdate(idCourse, data);

      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] courses/:id
  async deleteCourse(req, res, next) {
    try {
      const idCourse = req.params;
      await Course.deleteById(idCourse);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] courses/:id/restore
  async restoreCourse(req, res, next) {
    try {
      const idCourse = req.params;
      await Course.restore({
        _id: idCourse,
      });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] courses/:id/destroy
  async destroyCourse(req, res, next) {
    try {
      const idCourse = req.params;
      await Course.findByIdAndDelete(idCourse);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();

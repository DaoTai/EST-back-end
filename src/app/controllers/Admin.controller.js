import { deleteListCV, getListCVs } from "~/services/CV.service";
import {
  approveCourses,
  destroyCourseByAdmin,
  getListCoursesByAdmin,
  toggleApproveCourse,
} from "~/services/Course.service";
import { sendNotifyApprovedCoursesToTeacher } from "~/services/Notification.service";
import { deleteQuestion, getListQuestions } from "~/services/Question.service";
import {
  getAllUsers,
  getRegisterByProgrammingLanguages,
  prorammingLanguages,
  registerByProgrammingLanguages,
} from "~/services/Statistical.service";
import {
  authorizeAccounts,
  authorizeTeacher,
  getAllUserWithRole,
  getListUsers,
} from "~/services/User.service";

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
      if (!Array.isArray(listIdCourses)) {
        return res.status(400).json("List courses are invalid");
      }
      await approveCourses(listIdCourses);
      await sendNotifyApprovedCoursesToTeacher({ idUser: req.user._id, listIdCourses });
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  //   [PATCH] /admin/courses/:id
  async toggleApproveCourse(req, res, next) {
    try {
      const idCourse = req.params.id;
      const updatedCourse = await toggleApproveCourse(idCourse);
      if (updatedCourse.status === "approved") {
        await sendNotifyApprovedCoursesToTeacher({
          idUser: req.user._id,
          listIdCourses: [idCourse],
        });
      }
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  //  [DELETE] /admin/courses:id
  async deleteCourse(req, res, next) {
    try {
      if (!req.params.id) return res.status(400).json("No exist id course");
      await destroyCourseByAdmin(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/users?role=
  async getListsUsers(req, res, next) {
    try {
      const perPage = 20;
      const page = +req.query.page || 1;
      const { role, status, getAll } = req.query;
      if (getAll) {
        const listUsers = await getAllUserWithRole({ role, status });
        return res.status(200).json(listUsers);
      } else {
        const result = await getListUsers({ perPage, page, role, status });
        return res.status(200).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /admin/users
  async authorize(req, res, next) {
    try {
      const listIds = req.body.listIdUsers ?? [];
      const option = req.body.option || "authorize";

      if (option === "block" || option === "unBlock") {
        if (listIds.includes(req.user._id) && option === "block") {
          return res.status(403).json("No permission block admin account");
        }
        await authorizeAccounts(option, listIds);
        return res.sendStatus(204);
      } else {
        await authorizeTeacher(option, listIds);
        return res.sendStatus(201);
      }
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/cvs
  async getListCvs(req, res, next) {
    try {
      const perPage = 20;
      const page = +req.query.page || 1;
      const role = req.query.role || "teacher";
      const result = await getListCVs({ role, perPage, page });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /admin/cvs
  async deleteCvs(req, res, next) {
    try {
      const { listIdCvs } = req.body;
      if (listIdCvs && Array.isArray(listIdCvs) && listIdCvs.length > 0) {
        await deleteListCV(listIdCvs);
        return res.sendStatus(204);
      } else {
        return res.status(400).json("List ids are invalid");
      }
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/questions?page=""&content=""
  async getQuestions(req, res, next) {
    try {
      const page = +req.query.page || 1;
      const content = req.query.content;
      const category = req.query.category;
      const result = await getListQuestions({
        page,
        content,
        category,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /admin/questions/:id
  async deleteQuestion(req, res, next) {
    try {
      await deleteQuestion(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/statistical/programming-languages
  async getProrammingLanguages(req, res, next) {
    try {
      const data = await prorammingLanguages();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/statistical/register-by-programming-languages
  async getRegisterByProrammingLanguages(req, res, next) {
    try {
      const data = await registerByProgrammingLanguages();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /admin/statistical/users
  async getUsers(req, res, next) {
    try {
      const data = await getAllUsers();
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();

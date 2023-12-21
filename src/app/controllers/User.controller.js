import {
  cancelCourse,
  getRegisteredCourse,
  getRegisteredCourses,
  rateCourse,
  registerCourse,
} from "~/services/Course.service";
import {
  createComment,
  deleteComment,
  deleteReport,
  editComment,
  getComments,
  getDetailLessonToLearn,
  getRegisteredLessons,
  getUserAnswersByIdLesson,
  isRegistered,
  reportLesson,
} from "~/services/Lesson.service";
import { answerQuestion, getCustomizeQuestions } from "~/services/Question.service";
import User from "../models/User.model";
import {
  sendNotifyRegisterCourseToTeacher,
  sendNotifyToLessonComment,
} from "~/services/Notification.service";
import {
  getAvgScoreInRegisteredCoursesByIdUser,
  getPredictData,
  predictSuitableJobs,
} from "~/services/AI.service";
class UserController {
  // [GET] user/profile
  async searchProfile(req, res, next) {
    try {
      const { page: pageQuery, search: searchQuery, role: roleQuery } = req.query;
      const perPage = 12;
      const page = +pageQuery || 1;
      const regex = new RegExp(searchQuery, "i");
      const conditions = [
        {
          _id: { $ne: req.user._id },
        },
        {
          hashedPassword: 0,
        },
      ];
      // Exist query
      if (roleQuery) conditions[0].roles = { $in: [roleQuery] };
      if (searchQuery) conditions[0]["$or"] = [{ username: regex }, { fullName: regex }];
      const users = await User.find(...conditions)
        .skip(perPage * page - perPage)
        .limit(perPage);
      const totalUsers = await User.count(...conditions);

      return res.status(200).json({
        users,
        maxPage: Math.ceil(totalUsers / perPage),
        total: totalUsers,
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/profile/:id
  async getProfile(req, res, next) {
    try {
      const findUser = User.findById(req.params.id);
      const findOwnerCourses = getRegisteredCourses(req.params.id);
      const [user, listCourses] = await Promise.all([findUser, findOwnerCourses]);
      return res.status(200).json(
        user
          ? {
              profile: user.toProfileJSON(),
              listCourses,
            }
          : user
      );
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /user/change-password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || currentPassword === newPassword)
        return res.status(400).json("Passwords are invalid");
      if (newPassword.trim().length < 6)
        return res.status(401).json("Password is at least 6 characters");
      const user = await User.findById(req.user._id);
      if (!user.hashedPassword) return res.status(403).json("Account doesn't have password");
      const isValidPassword = user.isValidPassword(currentPassword, user.hashedPassword);

      if (!isValidPassword) return res.status(401).json("Current password is invalid");

      const newHashedPassword = user.hashPassword(newPassword);

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          hashedPassword: newHashedPassword,
        },
        {
          new: true,
        }
      );

      return res.status(201).json(updatedUser.toProfileJSON());
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] user/profile
  async editProfile(req, res, next) {
    const data = req.body;
    const file = req.file;
    try {
      if (file) {
        const currentUser = await User.findById(req.user._id);
        data.avatar = await currentUser.generateNewAvatar(file);
        await currentUser.deleteAvatar();
      }

      // Update data
      const editedUser = await User.findByIdAndUpdate(req.user._id, data, { new: true });

      return res.status(200).json(editedUser.toProfileJSON());
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/courses
  async getOwnerCourses(req, res, next) {
    try {
      const listCourses = await getRegisteredCourses(req.user._id);
      return res.status(200).json(listCourses);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/courses/:id
  async getOwnerCourse(req, res, next) {
    try {
      const data = await getRegisteredCourse({
        idRegisteredCourse: req.params.id,
        idUser: req.user._id,
      });
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // [POST] user/courses/:id
  async registerCourse(req, res, next) {
    try {
      const idCourse = req.params.id;
      const idUser = req.user._id;
      if (!idCourse) return res.status(400).json("Id course is required");
      const data = await registerCourse(idUser, idCourse);
      await sendNotifyRegisterCourseToTeacher({ idUser, idCourse });
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] user/courses/:id
  async rateCourse(req, res, next) {
    try {
      const { rating } = req.body;
      if (!rating) return res.status(400).json("Rating value is required");
      const idCourse = req.params.id;
      const idUser = req.user._id;
      await rateCourse(idUser, idCourse, rating);
      return res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] user/courses/:id
  async cancelCourse(req, res, next) {
    try {
      const idCourse = req.params.id;
      const idUser = req.user._id;
      if (!idCourse) return res.status(400).json("Id course is required");
      await cancelCourse(idUser, idCourse);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/lessons
  async getLessons(req, res, next) {
    try {
      const idCourse = req.query.idRegisteredCourse;
      if (!idCourse) return res.status(400).json("No have id course");
      const lessons = await getRegisteredLessons({
        idRegisteredCourse: idCourse,
        idUser: req.user._id,
      });
      return res.status(200).json(lessons);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/lessons/:id
  async getLesson(req, res, next) {
    try {
      const idLesson = req.params.id;
      const idRegisterCourse = req.query.idRegisterCourse;
      const idUser = req.user._id;
      if (!idRegisterCourse || !idLesson)
        return res.status(400).json("Id course and id lesson are required");
      // Kiểm tra user có trong khoá học đăng ký ko
      const isPermit = await isRegistered({ idRegisterCourse, idUser });
      if (!isPermit) {
        return res.status(403).json("You did not registered this course");
      }
      const lesson = await getDetailLessonToLearn(idLesson, idUser);
      const listAnswerRecords = await getUserAnswersByIdLesson(idUser, idLesson);
      return res.status(200).json({ lesson, listAnswerRecords });
    } catch (error) {
      next(error);
    }
  }

  // [POST] user/lessons/:id/reports
  async reportLesson(req, res, next) {
    try {
      const idUser = req.user._id;
      const idLesson = req.params.id;
      if (!idLesson) return res.status(400).json("Id lesson is required");
      const { content } = req.body;
      if (!content) {
        return res.status(400).json("Content report is required");
      }
      const reports = await reportLesson({ idLesson, idUser, content });
      return res.status(201).json(reports);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] user/lessons/:id/reports/:idReport
  async deleteReportLesson(req, res, next) {
    try {
      const idLesson = req.params.id;
      const idReport = req.params.idReport;
      if (!idLesson) return res.status(400).json("Id lesson is required");

      if (!idReport) return res.status(400).json("Id report is required");
      await deleteReport({ idLesson, idReport });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/lessons/:id/comments
  async getCommentsLesson(req, res, next) {
    try {
      const idLesson = req.params.id;
      if (!idLesson) return res.status(400).json("Id lesson is required");
      const page = +req.query.page || 1;
      const perPage = 10;
      const result = await getComments({
        idLesson,
        page,
        perPage,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [POST] user/lessons/:id/comments
  async commentLesson(req, res, next) {
    try {
      const idUser = req.user._id;
      const idLesson = req.params.id;
      const { content } = req.body;
      if (!idLesson) return res.status(400).json("Id lesson is required");
      if (!content) return res.status(400).json("Content comment is required");
      const comment = await createComment({ idUser, idLesson, content });
      await sendNotifyToLessonComment({
        idLesson,
        idUser,
      });
      return res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] user/lessons/:id/comments/:idComment
  async editCommentLesson(req, res, next) {
    try {
      const idComment = req.params.idComment;
      const { content, pin } = req.body;
      if (!idComment) return res.status(400).json("Id comment lesson is required");
      if (!content) return res.status(400).json("Content comment is required");
      const editedComment = await editComment({ idComment, content, pin });
      return res.status(200).json(editedComment);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] user/lessons/:id/comments/:idComment
  async deleteCommentLesson(req, res, next) {
    try {
      const idComment = req.params.idComment;
      if (!idComment) return res.status(400).json("Id comment lesson is required");
      await deleteComment(idComment);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/questions/self-train
  async selfTrainQuestions(req, res, next) {
    try {
      const { type } = req.query;
      if (!type) return res.status(400).json("Type to traing is required");
      const listQuestions = await getCustomizeQuestions({ idUser: req.user._id, type });
      return res.status(200).json(listQuestions);
    } catch (error) {
      next(error);
    }
  }

  // [POST] user/questions/:id
  async answerQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const { userAnswers, idRegisteredCourse } = req.body;
      if (!id) return res.status(400).json("Id question is required");
      if (!idRegisteredCourse) return res.status(400).json("Id registered course is required");
      if (!userAnswers || userAnswers.length === 0)
        return res.status(400).json("Not empty user's answers");

      const record = await answerQuestion({
        idRegisteredCourse,
        idQuestion: id,
        idUser: req.user._id,
        userAnswers,
      });
      return res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/predict
  async predict(req, res, next) {
    try {
      const getMyAvgScores = getAvgScoreInRegisteredCoursesByIdUser(req.user._id);
      const getAllData = getPredictData();
      const [myAvgScores, data] = await Promise.all([getMyAvgScores, getAllData]);

      if (getAllData.length === 0 || data.length === 0) {
        return res.status(400).json("Data not enough");
      }

      const result = await predictSuitableJobs({
        data,
        myAvgScores,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

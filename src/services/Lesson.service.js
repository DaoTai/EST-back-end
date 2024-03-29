import AnswerRecord from "~/app/models/AnswerRecord.model";
import Course from "~/app/models/Course.model";
import Lesson from "~/app/models/Lesson.model";
import LessonComment from "~/app/models/LessonComment.model";
import QuestionModel from "~/app/models/Question.model";
import RegisterCourse from "~/app/models/RegisterCourse.model";
import ApiError from "~/utils/ApiError";
import { uploadVideoByFirebase } from "~/utils/firebase";
import slugify from "~/utils/slugify";

// Get list lessons by id course
export const getLessonsByIdCourse = async ({ idCourse, currentPage, perPage = 10 }) => {
  const total = await Lesson.count({
    course: idCourse,
  });
  const listLessons = await Lesson.find({
    course: idCourse,
  })
    .skip(perPage * currentPage - perPage)
    .limit(perPage);
  return { listLessons, maxPage: Math.ceil(total / perPage) };
};

// Get lesson by id lesson
export const getLessonById = async (idLesson) => {
  const lesson = await Lesson.findById(idLesson).populate("course");
  return lesson ? lesson.getInfor() : lesson;
};

// Create lesson
// Tạo mới lesson + thêm lesson_id vào course tương ứng
export const createLesson = async (idCourse, data, file) => {
  if (!data) return;

  // Delete link references if invalid
  if (data?.references) {
    const inValidRefs = data.references.some((ref) => ref.length < 5);
    inValidRefs && delete data.references;
  }
  const newLesson = new Lesson({
    course: idCourse,
    ...data,
  });

  // Exist video file
  if (file) {
    await newLesson.createVideo(file);
  }

  await Course.updateOne(
    { _id: idCourse },
    {
      $push: {
        lessons: newLesson._id,
      },
    },
    {
      new: true,
    }
  );
  return await newLesson.save();
};

// Edit lesson
export const editLesson = async (idLesson, data, file) => {
  if (!idLesson || !data) return;
  if (data?.references) {
    const inValidRefs = data.references.some((ref) => ref.length < 5);
    inValidRefs && delete data.references;
  }
  const values = {
    name: data.name,
    isLaunching: data.isLaunching,
    theory: data.theory,
    references: data?.references,
  };

  const lesson = await Lesson.findById(idLesson);
  if (!lesson) return null;

  if (values.name && values.name !== lesson.name) values.slug = slugify(values.name);

  if (file) {
    const newLesson = new Lesson();
    // Delete prev video
    await lesson.deleteVideo();
    // Create new video
    values.video = await newLesson.createVideo(file);
  }

  const editedLesson = await Lesson.findByIdAndUpdate(idLesson, values, {
    new: true,
  });
  return editedLesson;
};

// Delete lesson: lesson, comment, passedLesson, question, answer records
export const deleteLesson = async (idLesson) => {
  if (!idLesson) return;
  // Xoá lesson
  const deletedLesson = await Lesson.findByIdAndDelete(idLesson);
  // Xoá comment trong lesson
  const handleDeleteComment = LessonComment.deleteMany({
    lesson: idLesson,
  });
  // Xoá các lesson đã pass
  const handleDeletePassedLesson = RegisterCourse.updateOne(
    {
      course: deletedLesson.course,
    },
    {
      $pull: {
        passedLessons: deletedLesson._id,
      },
    }
  );
  // Xoá các câu hỏi trong bài giảng
  const handleDeleteQuestions = QuestionModel.deleteMany({
    _id: {
      $in: deletedLesson.questions,
    },
  });

  // Xoá các câu trả lời của người học trong bài giảng
  const handleDeleteAnswerRecords = AnswerRecord.deleteMany({
    question: {
      $in: deletedLesson.questions,
    },
  });

  await Promise.all([
    deletedLesson.deleteVideo(),
    handleDeleteComment,
    handleDeletePassedLesson,
    handleDeleteQuestions,
    handleDeleteAnswerRecords,
  ]);
  return deletedLesson;
};

// ===== Registered course for user

// Check user in registered course
export const isRegistered = async ({ idUser, idRegisterCourse }) => {
  const course = await RegisterCourse.findOne({
    _id: idRegisterCourse,
    user: idUser,
  });
  return !!course;
};

// Get list lessons: passed + next lessons
export const getRegisteredLessons = async ({ idRegisteredCourse, idUser }) => {
  const registeredCourse = await RegisterCourse.findOne({
    _id: idRegisteredCourse,
    user: idUser,
  })
    .populate("passedLessons", "_id name")
    .populate({
      path: "course",
      match: {
        deleted: false,
      },
    });
  // Nếu không tồn tại khoá học đăng ký hoặc khoá học đã bị xoá tạm
  if (!registeredCourse || !registeredCourse.course) return null;
  const listIdsPassedLessons = registeredCourse.passedLessons.map((lesson) => String(lesson._id));
  const course = await Course.findOne({
    _id: registeredCourse.course,
  }).lean();
  course.lessons = await Lesson.find({ course: course._id }, { name: 1, isLaunching: 1 });
  // Lấy ra các lesson đã bật mode launch và chưa học
  const nextLessons = course?.lessons.filter((lesson) => {
    return lesson.isLaunching && !listIdsPassedLessons.includes(String(lesson._id));
  });

  return {
    passedLessons: registeredCourse.passedLessons,
    nextLessons,
  };
};

// Get detail lesson to learn
export const getDetailLessonToLearn = async (idLesson, idUser) => {
  const lesson = await Lesson.findOne({
    _id: idLesson,
    isLaunching: true,
  }).populate("questions", "-correctAnswers -explaination");

  if (lesson) {
    // Kiểm tra lesson đã pass chưa
    const isPassed = await RegisterCourse.findOne({
      user: idUser,
      passedLessons: {
        $elemMatch: { $eq: lesson._id },
      },
    });
    // Lesson chưa pass và không có câu hỏi nào thì passs
    if (!isPassed && lesson.questions.length === 0) {
      await RegisterCourse.updateOne(
        {
          user: idUser,
          course: lesson.course,
        },
        {
          $push: {
            passedLessons: lesson._id,
          },
        }
      );
    }
    return lesson.getInfor();
  }
  return lesson;
};

// Get answer of user by id lesson
export const getUserAnswersByIdLesson = async (idUser, idLesson) => {
  const lesson = await Lesson.findById(idLesson);
  if (!lesson) {
    throw new ApiError({
      statusCode: 404,
      message: "No exist lesson",
    });
  }
  const listRecords = await AnswerRecord.find({
    question: {
      $in: lesson.questions,
    },
    user: idUser,
  }).populate("question");

  return listRecords;
};

// Pass lesson registered course
export const passLesson = async ({ idLesson, idUser }) => {
  const lesson = await Lesson.findById(idLesson).populate("questions");
  if (!lesson) return;

  const questionsWithOutCode = lesson.questions.filter((question) => question.category !== "code");
  const totalQuestionWithOutCode = questionsWithOutCode.length;
  const questionsWithOutCodeIds = questionsWithOutCode.map((question) => question._id);

  // No question in lesson
  if (totalQuestionWithOutCode === 0) {
    await RegisterCourse.updateOne(
      {
        user: idUser,
        course: lesson.course,
        passedLessons: { $nin: [lesson._id] },
      },
      {
        $push: {
          passedLessons: lesson._id,
        },
      }
    );
    return;
  } else {
    // Tổng số câu hỏi đã trả lời trong bài học
    const totalAnsweredRecords = await AnswerRecord.count({
      user: idUser,
      question: {
        $in: questionsWithOutCodeIds,
      },
    });
    // Nếu đã trả lời hết câu hỏi trắc nghiệm
    if (totalQuestionWithOutCode === totalAnsweredRecords) {
      await RegisterCourse.updateOne(
        {
          user: idUser,
          course: lesson.course,
          passedLessons: { $nin: [lesson._id] },
        },
        {
          $push: {
            passedLessons: lesson._id,
          },
        }
      );
    }
  }
};

// ===========Report==========
// Report lesson registered course
export const reportLesson = async ({ idLesson, idUser, content }) => {
  const lesson = await Lesson.findByIdAndUpdate(
    idLesson,
    {
      $push: {
        reports: { user: idUser, content },
      },
    },
    {
      new: true,
    }
  );
  return lesson.reports;
};

// Delete report
export const deleteReport = async ({ idReport, idLesson }) => {
  await Lesson.updateOne(
    {
      _id: idLesson,
    },
    {
      $pull: {
        reports: {
          _id: idReport,
        },
      },
    }
  );
};

// =========Comment==========
// Get comments by id lesson
export const getComments = async ({ idLesson, page, perPage }) => {
  const countComments = LessonComment.count({ lesson: idLesson });
  const findComments = LessonComment.find({
    lesson: idLesson,
  })
    .populate("user", "avatar username")
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: -1 });
  const [listComments, totalComments] = await Promise.all([findComments, countComments]);

  return {
    listComments,
    maxPage: Math.ceil(totalComments / perPage),
    total: totalComments,
  };
};

// Create comment lesson
export const createComment = async ({ idLesson, idUser, content }) => {
  const newComment = new LessonComment({
    lesson: idLesson,
    user: idUser,
    content,
  });
  const savedComment = (await newComment.save()).populate("user", "avatar username");
  return savedComment;
};

// Edit comment lesson
export const editComment = async ({ idComment, content, pin }) => {
  const editedComment = await LessonComment.findByIdAndUpdate(
    idComment,
    {
      content,
      pin: !!pin,
    },
    {
      new: true,
    }
  );
  return editedComment;
};

// Delete comment lesson
export const deleteComment = async (idComment) => {
  await LessonComment.deleteOne({ _id: idComment });
};

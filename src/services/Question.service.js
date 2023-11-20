import Lesson from "~/app/models/Lesson.model";
import Question from "~/app/models/Question.model";
import AnswerRecord from "~/app/models/AnswerRecord.model";
import ApiError from "~/utils/ApiError";
import { passLesson } from "./Lesson.service";
import User from "~/app/models/User.model";
import Course from "~/app/models/Course.model";
import RegisterCourse from "~/app/models/RegisterCourse.model";

// =======Teacher=======
// Create question
export const createQuestion = async (body) => {
  const question = new Question(body);

  return await question.save();
};

// Create question by idLesson => Done
export const createQuestionByIdLesson = async (idLesson, body) => {
  const question = new Question(body);
  const lesson = await Lesson.findById(idLesson, { course: 1 }).populate("course", "type");
  if (lesson.course.type === "public" && question.category === "code") {
    throw new ApiError({
      statusCode: 403,
      message: "Public course cannot create code question",
    });
  }
  const newQuestion = await question.save();
  await Lesson.updateOne(
    {
      _id: idLesson,
    },
    {
      $push: {
        questions: question._id,
      },
    }
  );
  return newQuestion;
};

// Get question by idLesson => Done
export const getQuestionsByIdLesson = async (idLesson) => {
  const lessons = await Lesson.findById(idLesson, {
    questions: 1,
  }).populate("questions");
  return lessons.questions;
};

// Get question by id => Done
export const getQuestionById = async (idQuestion) => {
  const question = await Question.findById(idQuestion);
  return question;
};

// Edit question => Done
export const editQuestion = async (idQuestion, data) => {
  if (data?.category === "code") {
    return await Question.findByIdAndUpdate(
      idQuestion,
      {
        ...data,
        $unset: {
          correctAnswers: 1,
        },
      },
      {
        new: true,
      }
    );
  }

  return await Question.findByIdAndUpdate(idQuestion, data, {
    new: true,
  });
};

// Delete question => Done
export const deleteQuestion = async (idQuestion) => {
  const deleteQuestion = Question.deleteOne({ _id: idQuestion });

  const deleteQuestionInLesson = Lesson.updateOne(
    {
      questions: { $in: idQuestion },
    },
    {
      $pull: {
        questions: idQuestion,
      },
    }
  );

  await Promise.all([deleteQuestion, deleteQuestionInLesson]);
};

// Get answer record by ID lesson
export const getListAnswerRecordByIdQuestion = async (idQuestion) => {
  const answerRecords = await AnswerRecord.find({
    question: idQuestion,
  }).populate("user", "username");
  return answerRecords;
};

// Handle give score code question for member
export const giveScoreCodeQuestion = async ({ idAnswerRecord, score, comment }) => {
  await AnswerRecord.updateOne(
    { _id: idAnswerRecord },
    {
      score: score,
      comment: comment,
    }
  );
};

// =======User=======
// Answer question
export const answerQuestion = async ({ idQuestion, idUser, userAnswers, idRegisteredCourse }) => {
  const totalUserAnswers = userAnswers.length;
  const question = await Question.findById(idQuestion);
  if (!question) return null;
  const answerRecord = await AnswerRecord.findOne({
    question: idQuestion,
    user: idUser,
    idRegisteredCourse: idRegisteredCourse,
  });

  // Nếu đã có câu trả lời trước đó rồi thì cập nhật lại (question code, hiện tại có thể redo cả trắc nghiệm)
  if (answerRecord) {
    return await changeAnswerQuestion(answerRecord._id, userAnswers);
  } else {
    const record = new AnswerRecord({
      user: idUser,
      question: idQuestion,
      idRegisteredCourse: idRegisteredCourse,
      answers: userAnswers,
    });
    let newRecord;
    if (question.category === "code") {
      newRecord = await record.save();
    } else {
      const correctAnswers = question.correctAnswers;
      const totalCorrectAnswers = correctAnswers.length;
      let totalCorrectAnswerOfUser = 0;
      correctAnswers.forEach((correct) => {
        if (Array.isArray(userAnswers) && userAnswers.includes(correct)) {
          totalCorrectAnswerOfUser += 1;
        }
      });

      // Nếu category của question là multiple-choice mà user chọn nhiều hơn
      // số đáp án đúng thì score = 0
      // Chọn ít hơn thì được tính điểm
      if (totalUserAnswers > totalCorrectAnswers) {
        record.score = 0;
      } else {
        record.score = (totalCorrectAnswerOfUser / totalCorrectAnswers) * 10;
      }
      newRecord = (await record.save()).populate("question");
    }
    const lesson = await Lesson.findOne({
      questions: {
        $in: question._id,
      },
    });
    if (lesson) {
      await passLesson({ idLesson: lesson._id, idUser: idUser });
    }

    return newRecord;
  }
};

// Change aswer question (category is CODE)
export const changeAnswerQuestion = async (idAnswerRecord, newAnswers) => {
  const answerRecord = await AnswerRecord.findById(idAnswerRecord).populate("question");
  if (!answerRecord) throw new ApiError({ statusCode: 400, message: "Not found answer record" });

  if (answerRecord.question.category === "code") {
    return await AnswerRecord.findByIdAndUpdate(idAnswerRecord, {
      answers: newAnswers,
    });
  } else {
    throw new ApiError({ statusCode: 401, message: "Only category is code that can be updated" });
  }
};

// Training with Do choice / multiple-choice questions
// Tạo ra các bài tập trắc nghiệm dựa vào
// - Các ngôn ngữ lập trình của các khoá học đã đăng ký => Tìm các câu hỏi lquan tương ứng với các khoá cùng keyword
// - Các ngôn ngữ lập trình yêu thích của cá nhân
export const getCustomizeQuestions = async ({ type, idUser }) => {
  const checkTypes = ["byFavouriteProgrammingLanguages", "byCourseCategories"];

  if (!checkTypes.includes(type)) {
    throw new ApiError({ statusCode: 400, message: "Type to train is invalid" });
  }

  // Chứa danh sách các id lesson
  let idLessons = [];

  if (type === "byFavouriteProgrammingLanguages") {
    const user = await User.findById(idUser);

    // Lấy ra các course có ngôn ngữ lập trình phù hợp với user
    const listCourses = await Course.find(
      {
        programmingLanguages: {
          $in: user.favouriteProrammingLanguages,
        },
      },
      {
        lessons: 1,
      }
    );

    // Lấy tổng hợp các id lesson với từng course
    idLessons = listCourses.reduce((acc, course) => [...acc, ...course.lessons], []);

    // Cách 1:
    // const listLessons = await Lesson.find(
    //   {
    //     _id: {
    //       $in: idLessons,
    //     },
    //   },
    //   {
    //     questions: 1,
    //   }
    // );
    // const listIdLessons = listLessons.reduce((acc, lesson) => [...acc, ...lesson.questions], []);
    // const listQuestions = await Question.find({
    //   _id: {
    //     $in: listIdLessons,
    //   },
    //   category: {
    //     $nin: ["code"],
    //   },
    // });
  }

  if (type === "byCourseCategories") {
    // Lấy ra các khoá học đã đăng ký
    const listRegisterCourses = await RegisterCourse.find({
      user: idUser,
    }).populate("course");

    // Lấy ra các category (ko trùng lặp) của các course
    const uniqueCategories = new Set(
      listRegisterCourses.reduce(
        (acc, registerCourse) => [...acc, registerCourse.course.category],
        []
      )
    );

    // Lấy ra các khoá học có categories tương ứng
    const listCourses = await Course.find({
      category: {
        $in: Array.from(uniqueCategories),
      },
    });
    idLessons = listCourses.reduce((acc, course) => [...acc, ...course.lessons], []);
  }

  // Lấy ra các lesson có questions dạng trắc nghiệm (category !== code)
  const listLessons = await Lesson.aggregate([])
    .match({
      _id: {
        $in: idLessons,
      },
    })
    .lookup({
      from: "questions",
      as: "questions",
      localField: "questions",
      foreignField: "_id",
    })
    .match({
      "questions.category": {
        $ne: "code",
      },
    })
    .unwind("questions");

  // vì questions là 1 mảng nên có thể tách từng question thành 1 document riêng có cùng _id là id lesson, nếu mảng trống thì bỏ qua

  const listQuestions = listLessons.map((lesson) => lesson.questions);

  return listQuestions;
};

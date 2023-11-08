import Lesson from "~/app/models/Lesson.model";
import Question from "~/app/models/Question.model";
import AnswerRecord from "~/app/models/AnswerRecord.model";
import ApiError from "~/utils/ApiError";
import { passLesson } from "./Lesson.service";

// =======Teacher=======
// Create question
export const createQuestion = async (body) => {
  const question = new Question(body);

  return await question.save();
};

// Create question by idLesson => Done
export const createQuestionByIdLesson = async (idLesson, body) => {
  const question = new Question(body);
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

// =======User=======
// Answer question
export const answerQuestion = async ({ idQuestion, idUser, userAnswers }) => {
  const totalUserAnswers = userAnswers.length;
  const question = await Question.findById(idQuestion);
  if (!question) return null;
  const answerRecord = await AnswerRecord.findOne({
    question: idQuestion,
    user: idUser,
  });

  if (answerRecord) {
    return await changeAnswerQuestion(answerRecord._id, userAnswers);
  } else {
    const record = new AnswerRecord({
      user: idUser,
      question: idQuestion,
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

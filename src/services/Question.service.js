import Lesson from "~/app/models/Lesson.model";
import Question from "~/app/models/Question.model";
import QuestionUser from "~/app/models/AnswerRecord";

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
  const record = new QuestionUser({
    user: idUser,
    question: idQuestion,
    answers: userAnswers,
  });

  const question = await Question.findById(idQuestion);
  if (question.category === "code") {
    return await record.save();
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
    record.score =
      totalUserAnswers > totalCorrectAnswers
        ? 0
        : (totalCorrectAnswerOfUser / totalCorrectAnswers) * 10;
    return await record.save();
  }
};

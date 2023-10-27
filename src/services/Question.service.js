import Lesson from "~/app/models/Lesson.model";
import Question from "~/app/models/Question.model";

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

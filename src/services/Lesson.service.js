import Lesson from "~/app/models/Lesson.model";
import Course from "~/app/models/Course.model";
import slugify from "~/utils/slugify";
import RegisterCourse from "~/app/models/RegisterCourse.model";
import mongoose from "mongoose";
import ApiError from "~/utils/ApiError";
import RecordAnswer from "~/app/models/AnswerRecord";

// Get list lessons by id course
export const getLessonsByIdCourse = async ({ idCourse, currentPage, perPage }) => {
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
  if (data?.references) {
    const inValidRefs = data.references.some((ref) => ref.length < 5);
    inValidRefs && delete data.references;
  }
  const newLesson = new Lesson({
    course: idCourse,
    ...data,
  });
  file && newLesson.createVideo(file);
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

  console.log(values);

  const lesson = await Lesson.findById(idLesson);
  if (!lesson) return null;

  if (values.name && values.name !== lesson.name) values.slug = slugify(values.name);

  if (file) {
    const newLesson = new Lesson();
    values.video = newLesson.createVideo(file);
    lesson.deleteVideo();
  }

  const editedLesson = await Lesson.findByIdAndUpdate(idLesson, values, {
    new: true,
  });
  return editedLesson;
};

// Delete lesson
// Xoá lesson + lesson tại Course
export const deleteLesson = async (idLesson) => {
  if (!idLesson) return;
  const deletedLesson = await Lesson.findByIdAndDelete(idLesson);
  deletedLesson.deleteVideo();
  await Course.updateOne(
    {
      _id: deletedLesson.course,
    },
    {
      $pull: {
        lessons: deletedLesson._id,
      },
    }
  );
  return deletedLesson;
};

// ===== Registered course for user
// Get list lessons: passed + next lessons
export const getRegisteredLessons = async (idRegisteredCourse) => {
  const registeredCourse = await RegisterCourse.findById(idRegisteredCourse).populate(
    "passedLessons"
  );
  if (!registeredCourse) return null;
  const course = await Course.findOne(
    {
      _id: registeredCourse.course,
      lessons: {
        $nin: registeredCourse.passedLessons,
      },
    },
    {
      lessons: 1,
    }
  ).populate("lessons", "_id name");

  if (!course) return course;

  return {
    passedLessons: registeredCourse.passedLessons,
    nextLessons: course.lessons,
  };
};

// Get detail lesson
export const getDetailLesson = async (idLesson) => {
  const lesson = await Lesson.findOne({
    _id: idLesson,
    isLaunching: true,
  }).populate("questions", "-correctAnswers -explaination");
  return lesson ? lesson.getInfor() : lesson;
};

export const getUserAnswersByIdLesson = async (idUser, idLesson) => {
  const lesson = await Lesson.findById(idLesson);
  const listRecords = await RecordAnswer.find({
    question: {
      $in: lesson.questions,
    },
    user: idUser,
  }).populate("question");

  return listRecords;
};

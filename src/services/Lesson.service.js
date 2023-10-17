import Lesson from "~/app/models/Lesson.model";
import slugify from "~/utils/slugify";

// Get list lessons by id course
export const getLessonsByIdCourse = async (idCourse) => {
  const listLessons = await Lesson.find({
    course: idCourse,
  }).populate("course");
  return listLessons.map((lesson) => lesson.getInfor());
};

// Get lesson by id lesson
export const getLessonById = async (idLesson) => {
  const lesson = await Lesson.findById(idLesson);
  return lesson;
};

// Create lesson
export const createLesson = async (idCourse, data, file) => {
  if (!data) return;
  const newLesson = new Lesson({
    course: idCourse,
    ...data,
  });
  return await newLesson.save();
};

// Edit lesson
export const editLesson = async (idLesson, data, file) => {
  if (!idLesson || !data) return;
  const values = {
    name: data.name,
    isLaunching: data.isLaunching,
    theory: data.theory,
    references: data.references,
  };

  const lesson = await Lesson.findById(idLesson);
  if (values.name && values.name !== lesson.name) values.slug = slugify(values.name);
  const editedLesson = await Lesson.findByIdAndUpdate(idLesson, values);

  return editedLesson;
};

// Delete lesson
export const deleteLesson = async (idLesson) => {
  if (!idLesson) return;
  return await Lesson.deleteOne({
    _id: idLesson,
  });
};

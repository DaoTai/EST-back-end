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
  newLesson.createVideo(file);
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
export const deleteLesson = async (idLesson) => {
  if (!idLesson) return;
  const deletedLesson = await Lesson.findByIdAndDelete(idLesson);
  deletedLesson.deleteVideo();
  return deletedLesson;
};

// Get by slug lesson
export const getLessonBySlug = async (slug, idUser) => {
  if (!slug || !idUser) return null;

  const lesson = await Lesson.findOne({
    slug: slug,
  });
};

import Course from "~/app/models/Course.model";
import slugify from "~/utils/slugify";

// For teacher
// Search
export const getOwnerCourses = async (idUser) => {
  const courses = await Course.find({
    createdBy: idUser,
  });

  return courses;
};

// Get by id
export const getCourseById = async (idCourse, idUser) => {
  const course = await Course.findOne({
    _id: idCourse,
    createdBy: idUser,
  });
  return course;
};

// Create
export const createCourse = async (data, idUser, files = []) => {
  const { thumbnail, roadmap } = files;
  const newCourse = new Course({
    ...data,
    createdBy: idUser,
  });

  thumbnail && (await newCourse.uploadThumbnail(thumbnail[0]));
  roadmap && newCourse.createRoadmap(roadmap[0]);
  return await newCourse.save();
};

// Edit
export const editCourse = async (data, idCourse, idUser) => {
  const oldCourse = await Course.findOne({
    _id: idCourse,
    createdBy: idUser,
  });

  if (oldCourse.name !== data.name) {
    data.slug = slugify(data.name);
  }

  const course = await Course.findOneAndUpdate(
    {
      _id: idCourse,
      createdBy: idUser,
    },
    data,
    {
      new: true,
    }
  );
  return course;
};

// Soft delete
export const softDeleteCourse = async (idCourse) => {
  await Course.deleteById(idCourse);
};

// Restore
export const restoreCourse = async (idCourse) => {
  await Course.restore({
    _id: idCourse,
  });
};

// Destroy: Allow owner or admin
export const destroyCourse = async (idCourse, idUser, roles) => {
  const course = await Course.findOneWithDeleted({
    _id: idCourse,
  });
  const isOwner = String(course.createdBy) === idUser;
  if (roles.includes("admin") || isOwner) {
    await Course.deleteOne({
      _id: idCourse,
    });
  }
};

import Course from "~/app/models/Course.model";
import slugify from "~/utils/slugify";

// For teacher
// Search => Done
export const getOwnerCourses = async (idUser) => {
  const courses = await Course.find({
    createdBy: idUser,
  });

  return courses;
};

// Search softed delete courses
export const getTrashedCourses = async (idUser) => {
  const courses = await Course.findDeleted({
    createdBy: idUser,
  });
  return courses;
};

// Get by id => Done
export const getCourseById = async (idCourse, idUser) => {
  const course = await Course.findOne({
    _id: idCourse,
    createdBy: idUser,
  });
  return course;
};

// Create => Done
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

// Edit => Done
export const editCourse = async (data, idCourse, idUser, files = []) => {
  const { thumbnail, roadmap } = files;
  const oldCourse = await Course.findOne({
    _id: idCourse,
    createdBy: idUser,
  });
  if (oldCourse.name !== data.name) {
    data.slug = slugify(data.name);
  }

  const course = new Course();
  if (thumbnail) {
    const [resDelete, resThumbnail] = await Promise.all([
      oldCourse.deleteThumbnail(),
      course.uploadThumbnail(thumbnail[0]),
    ]);
    data.thumbnail = resThumbnail;
  }

  if (roadmap) {
    oldCourse.deleteRoadmap();
    data.roadmap = course.createRoadmap(roadmap[0]);
  }
  const editedCourse = await Course.findOneAndUpdate(
    {
      _id: idCourse,
      createdBy: idUser,
    },
    data,
    {
      new: true,
    }
  );

  return editedCourse;
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

// Destroy: Allow owner or admin => Done
export const destroyCourse = async (idCourse, idUser, roles) => {
  const course = await Course.findOneWithDeleted({
    _id: idCourse,
  });
  const isOwner = String(course.createdBy) === idUser;
  if (roles.includes("admin") || isOwner) {
    const deletedCouse = await Course.findOneAndDelete({
      _id: idCourse,
    });
    await Promise.all([deletedCouse.deleteThumbnail(), deletedCouse.deleteRoadmap()]);
  }
};

import Course from "~/app/models/Course.model";
import Lesson from "~/app/models/Lesson.model";
import slugify from "~/utils/slugify";

// ======== For teacher  ========
// Search => Done
export const getOwnerCourses = async (idUser) => {
  const courses = await Course.find({
    createdBy: idUser,
    deleted: false,
  });
  return courses;
};

// Search softed delete courses => Done
export const getTrashedCourses = async (idUser) => {
  // 16/10/2023: method findDeleted not working
  const courses = await Course.find({
    createdBy: idUser,
    deleted: true,
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

  if (data.name && oldCourse.name !== data.name) {
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

// Soft delete => Done
export const softDeleteCourse = async (idCourse) => {
  await Course.updateOne(
    {
      _id: idCourse,
    },
    {
      deleted: true,
      deletedAt: new Date(),
    }
  );
};

// Restore => Done
export const restoreCourse = async (idCourse) => {
  // Convert flag deleted and remove field deletedAt
  await Course.updateOne(
    {
      _id: idCourse,
    },
    {
      deleted: false,
      $unset: { deletedAt: 1 },
    }
  );
};

// Destroy: Allow owner or admin => Done
// Xoá course + lessons
export const destroyCourse = async (idCourse, idUser) => {
  const course = await Course.findOne({
    _id: idCourse,
    deleted: true,
  });
  if (course) {
    const isOwner = String(course.createdBy) === idUser;
    if (isOwner) {
      const deletedCouse = await Course.findOneAndDelete({
        _id: idCourse,
      });
      // Delete: thumbnail + roadmap + lessons
      await Promise.all([
        deletedCouse.deleteThumbnail(),
        deletedCouse.deleteRoadmap(),
        Lesson.deleteMany({
          _id: { $in: deletedCouse.lessons },
        }),
      ]);
    }
  }
};

// ======== For visitor  ========
// Search courses by visitor => Done
export const searchCourses = async ({ perPage, currentPage, condition }) => {
  const courses = await Course.find(condition, {
    status: 0,
  })
    .populate("createdBy", "username avatar")
    .skip(currentPage * perPage - perPage)
    .limit(perPage);
  const totalCourses = await Course.count(condition);
  return {
    courses: courses.map((course) => course.getPreview()),
    maxPage: Math.ceil(totalCourses / perPage),
    total: totalCourses,
  };
};

// ======== For user  ========
// Register course by user
export const registerCourse = async (idCourse, idUser) => {};

// ======== For admin  ========
// get list detail information about course => Done
export const getListCoursesByAdmin = async ({ condition, currentPage, perPage }) => {
  const courses = await Course.find(condition)
    .populate("lessons", "name reports")
    .populate("createdBy", "username avatar")
    .skip(perPage * currentPage - perPage)
    .limit(perPage);
  const total = await Course.count(condition);
  return { courses, maxPage: Math.round(total / perPage), total };
};

// Approve courses => Done
export const approveCourses = async (listIdCourses) => {
  await Course.updateMany(
    {
      _id: { $in: listIdCourses },
    },
    {
      status: "approved",
    }
  );
};

// UnApprove course => Done
export const toggleApproveCourse = async (idCourse) => {
  const course = await Course.findById(idCourse);
  await Course.updateOne(
    {
      _id: idCourse,
    },
    {
      status: course.status === "pending" ? "approved" : "pending",
    }
  );
};

// Destroy course by admin => Done
export const destroyCourseByAdmin = async (idCourse) => {
  const deletedCouse = await Course.findOneAndDelete({
    _id: idCourse,
  });
  // Delete: thumbnail + roadmap + lessons
  await Promise.all([
    deletedCouse.deleteThumbnail(),
    deletedCouse.deleteRoadmap(),
    Lesson.deleteMany({
      _id: { $in: deletedCouse.lessons },
    }),
  ]);
};

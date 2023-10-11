import Course from "~/app/models/Course.model";
import slugify from "~/utils/slugify";

// For teacher
// Search
export const searchCourse = async (query, idUser) => {
  const { page, name, category } = query;
  const perPage = 10;
  const currentPage = +page || 1;
  const condition = {
    createdBy: idUser,
  };
  if (name) condition.name = new RegExp(name, "i");
  if (category) condition.category = new RegExp(category, "i");
  const courses = await Course.find(condition, {
    status: 0,
  })
    .skip(currentPage * perPage - perPage)
    .limit(perPage);
  const totalCourses = await Course.count(condition);

  return {
    courses,
    maxPage: Math.ceil(totalCourses / perPage),
    total: totalCourses,
  };
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
export const createCourse = async (data, idUser) => {
  const newCourse = new Course({
    ...data,
    createdBy: idUser,
  });
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

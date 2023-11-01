import Course from "~/app/models/Course.model";
import Lesson from "~/app/models/Lesson.model";
import RegisterCourse from "~/app/models/RegisterCourse.model";
import ApiError from "~/utils/ApiError";
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

// Get detail course
export const getDetailCourse = async (slug) => {
  const course = await Course.findOne(
    { slug: slug, status: "approved" },
    {
      roadmap: 0,
      status: 0,
    }
  )
    .populate("lessons", "-questions -comments")
    .populate({
      path: "createdBy",
      select: "-hashedPassword -email -provider",
    });

  // Lấy ra TB cộng rating từ RegisterCourse (các khoá học đã có người học)
  const avgRates = await RegisterCourse.aggregate([
    {
      $match: {
        course: course._id,
        rating: { $exists: true }, // only get register course has rate
      },
    },
    {
      $group: {
        _id: course._id,
        averageRating: {
          $avg: "$rating", // tính trung bình cộng của field rating
        },
        totalRating: { $sum: 1 }, // mỗi document sẽ cộng dồn tổng 1
      },
    },
  ]);

  return { ...course.toObject(), ...avgRates[0] };
};

// ======== For user  ========
// Register course by user => Done
export const registerCourse = async (idUser, idCourse) => {
  const now = new Date();
  const course = await Course.findById(idCourse);
  const isExistedMember = course.members.includes(idUser);

  // TH: đã là thành viên của course
  if (isExistedMember) {
    throw new ApiError({
      message: "User was existed member",
      statusCode: 403,
    });
  }

  // TH: course là private + hết hạn đăng ký thì huỷ
  if (course.type === "private" && now.getTime() > course.closeDate.getTime()) {
    throw new ApiError({
      message: "Register time has expired",
      statusCode: 403,
    });
  }

  const register = new RegisterCourse({
    user: idUser,
    course: idCourse,
  });
  const savedRegister = await register.save();
  await Course.updateOne(
    {
      _id: idCourse,
    },
    {
      $push: {
        members: idUser,
      },
    }
  );
  return savedRegister;
};

// Cancel course by user => Done
export const cancelCourse = async (idUser, idCourse) => {
  const deletedRegister = RegisterCourse.deleteOne({
    user: idUser,
    course: idCourse,
  });
  const cancelCourse = Course.updateOne(
    {
      _id: idCourse,
    },
    {
      $pull: {
        members: idUser,
      },
    }
  );

  await Promise.all([deletedRegister, cancelCourse]);
};

// Get registered courses => Done
export const getRegisteredCourses = async (idUser) => {
  const listCourse = await RegisterCourse.find({
    user: idUser,
  }).populate("course", "name thumbnail slug type");
  return listCourse;
};

// Rate course => Done
export const rateCourse = async (idUser, idCourse, rate) => {
  if (isNaN(+rate)) throw new ApiError({ statusCode: 400, message: "Invalid rate" });
  const res = await RegisterCourse.updateOne(
    {
      user: idUser,
      course: idCourse,
    },
    {
      rating: +rate,
    }
  );
  if (res.matchedCount === 0) {
    throw new ApiError({
      statusCode: 401,
      message: "Rating failed. You must be registered course",
    });
  }
};

// Get registered course
export const getRegisteredCourse = async (idUser) => {};

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

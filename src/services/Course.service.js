import AnswerRecord from "~/app/models/AnswerRecord.model";
import Course from "~/app/models/Course.model";
import Lesson from "~/app/models/Lesson.model";
import RegisterCourse from "~/app/models/RegisterCourse.model";
import ApiError from "~/utils/ApiError";
import { transformImageUri } from "~/utils/attachment";
import slugify from "~/utils/slugify";
import { deleteLesson } from "./Lesson.service";

// ======== For teacher  ========
// Search => Done
export const getOwnerCourses = async (idUser) => {
  const courses = await Course.find({
    createdBy: idUser,
    deleted: false,
  })
    .lean()
    .sort({
      updatedAt: -1,
    });

  for (const index in courses) {
    const idCourse = courses[index]._id;
    const totalLessons = await Lesson.count({
      course: idCourse,
    });
    courses[index].totalLessons = totalLessons;
    courses[index].members = await RegisterCourse.find({
      course: idCourse,
    });
  }

  return courses;
};

// Search softed delete courses => Done
export const getTrashedCourses = async (idUser) => {
  const courses = await Course.find({
    createdBy: idUser,
    deleted: true,
  }).lean();

  // Get lessons
  for (const index in courses) {
    const idCourse = courses[index]._id;
    const getTotalLessons = Lesson.count({
      course: idCourse,
    });

    const getMembers = RegisterCourse.distinct("user", {
      course: idCourse,
    });

    const [totalLessons, members] = await Promise.all([getTotalLessons, getMembers]);

    courses[index].members = members;
    courses[index].totalLessons = totalLessons;
  }
  return courses;
};

// Get owner by id => Done
export const getOwnerCourseById = async (idCourse, idUser) => {
  const course = await Course.findOne({
    _id: idCourse,
    createdBy: idUser,
  });
  if (!course) return null;
  course.totalLessons = await Lesson.count({ course: idCourse });
  return await course.getInfor();
};

// Get by id
export const getCourseById = async (idCourse) => {
  const course = await Course.findById(idCourse);
  course.totalLessons = await Lesson.count({ course: idCourse });
  return await course.getInfor();
};

// Create => Done
export const createCourse = async (data, idUser, files = []) => {
  const { thumbnail, roadmap } = files;
  const newCourse = new Course({
    ...data,
    createdBy: idUser,
  });

  thumbnail && (await newCourse.uploadThumbnail(thumbnail[0]));
  roadmap && (await newCourse.createRoadmap(roadmap[0]));
  return await newCourse.save();
};

// Edit => Done
export const editCourse = async (data, idCourse, idUser, files = []) => {
  const { thumbnail, roadmap } = files;
  const oldCourse = await Course.findOne({
    _id: idCourse,
    createdBy: idUser,
  });

  // Cập nhật slug khi thay đổi tên
  if (data.name && oldCourse.name !== data.name) {
    data.slug = slugify(data.name);
  }

  const course = new Course();
  // Xoá thumbnail & roadmap cũ (nếu có)
  if (thumbnail) {
    const [resDelete, resThumbnail] = await Promise.all([
      oldCourse.deleteThumbnail(),
      course.uploadThumbnail(thumbnail[0]),
    ]);
    data.thumbnail = resThumbnail;
  }

  if (roadmap) {
    await oldCourse.deleteRoadmap();
    data.roadmap = await course.createRoadmap(roadmap[0]);
  }

  // Thay đổi private -> public: xoá openDate & closeDate
  if (data.type === "public" && oldCourse.type === "private") {
    const editedCourse = await Course.findOneAndUpdate(
      {
        _id: idCourse,
        createdBy: idUser,
      },
      {
        ...data,
        $unset: {
          openDate: 1,
          closeDate: 1,
        },
      },
      {
        new: true,
      }
    );
    return editedCourse;
  } else {
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
  }
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
// Cần xoá: course(thumbnail), lesson (video), register course
// + comment tại Course + câu hỏi + câu trả lời của câu hỏi
export const destroyCourse = async (idCourse, idUser) => {
  const course = await Course.findOne({
    _id: idCourse,
    deleted: true,
  });
  if (course) {
    const isOwner = String(course.createdBy) === idUser;
    if (isOwner) {
      const deletedCouse = await Course.findOne({
        _id: idCourse,
      });

      // Find lesson in course
      const lessons = await Lesson.find({
        course: idCourse,
      });

      // Delete video in lesson
      for (const lesson of lessons) {
        await lesson.deleteVideo();
      }

      // // Delete registered course
      const deletedRegisteredCourses = RegisterCourse.deleteMany({
        course: idCourse,
      });

      // Delete lessons
      const lessonIds = await Lesson.distinct("_id", {
        course: idCourse,
      });

      for (const lessonId of lessonIds) {
        await deleteLesson(lessonId);
      }

      // // Delete course
      const deleteCourse = Course.deleteOne({
        _id: idCourse,
      });

      // // Delete: thumbnail + roadmap + lessons + registeredCourse
      await Promise.all([
        deletedCouse.deleteThumbnail(),
        deletedCouse.deleteRoadmap(),
        deletedRegisteredCourses,
        deleteCourse,
      ]);
    }
  }
};

// Register course by user => Done
export const appendNewUserToCourse = async (idUser, idCourse) => {
  // Check status register
  const isRegistered = await RegisterCourse.exists({
    user: idUser,
    course: idCourse,
  });

  // TH: đã là thành viên của course
  if (isRegistered) {
    throw new ApiError({
      message: "User was existed member",
      statusCode: 403,
    });
  }

  const register = new RegisterCourse({
    user: idUser,
    course: idCourse,
  });
  const savedRegister = await register.save();
  return savedRegister;
};

// ======== For admin  ========
// get list detail information about course => Done
export const getListCoursesByAdmin = async ({ condition, currentPage, perPage }) => {
  const queryCourses = await Course.find(condition)
    .lean()
    .sort({
      createdAt: -1,
    })
    .populate("createdBy", "username avatar")
    .skip(perPage * currentPage - perPage)
    .limit(perPage);

  // Get lessons compatible with course
  for (const index in queryCourses) {
    const idCourse = queryCourses[index]._id;
    const lessons = await Lesson.find(
      {
        course: idCourse,
      },
      { reports: 1, name: 1 }
    );
    const registerCourses = await RegisterCourse.find({
      course: idCourse,
    }).populate("user", "-hashedPassword");
    const members = registerCourses.map((registerCourse) => registerCourse.user);
    queryCourses[index].lessons = lessons;
    queryCourses[index].members = members;
  }

  const total = await Course.count(condition);
  return { courses: queryCourses, maxPage: Math.round(total / perPage), total };
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
  const newCourse = await Course.findByIdAndUpdate(
    {
      _id: idCourse,
    },
    {
      status: course.status === "pending" ? "approved" : "pending",
    },
    {
      new: true,
    }
  );
  return newCourse;
};

// Destroy course by admin => Done

export const destroyCourseByAdmin = async (idCourse) => {
  const deletedCouse = await Course.findOne({
    _id: idCourse,
  });

  if (!deletedCouse) {
    throw new ApiError({
      statusCode: 400,
      message: "Not found course",
    });
  }

  // Delete lessons + comment in lessons
  const lessons = await Lesson.find({
    course: { $in: idCourse },
  });

  for (const lesson of lessons) {
    await deleteLesson(lesson._id);
  }

  // Deleete regiser courses
  const deletedRegisteredCourses = RegisterCourse.deleteMany({
    course: idCourse,
  });

  const deleteCourse = Course.deleteOne({
    _id: idCourse,
  });

  // Delete: thumbnail + roadmap
  await Promise.all([
    deletedCouse.deleteThumbnail(),
    deletedCouse.deleteRoadmap(),
    deletedRegisteredCourses,
    deleteCourse,
  ]);
};

// ======== For visitor  ========
// Search courses by visitor => Done
export const searchCourses = async ({ perPage = 10, currentPage, condition, requiredRating }) => {
  const totalCourses = await Course.count(condition);
  const courses = await Course.find(condition, {
    status: 0,
  })
    .sort({
      createdAt: -1,
    })
    .populate("createdBy", "username avatar")
    .skip(currentPage * perPage - perPage)
    .limit(perPage);

  let listCourses = [];
  for (const index in courses) {
    // Get lesson
    courses[index].totalLessons = await Lesson.count({ course: courses[index]._id });

    // Get rating
    const rating = await RegisterCourse.aggregate([])
      .match({
        course: courses[index]._id,
        rating: { $exists: true },
      })
      .group({
        _id: courses[index]._id,
        averageRating: { $avg: "$rating" },
        totalRating: { $sum: 1 },
      });

    // Get infor course
    const course = await courses[index].getPreview();
    listCourses.push({
      ...course,
      ...rating[0],
    });
  }

  // Filter course by rating & sort increase
  if (requiredRating) {
    listCourses = listCourses
      .filter((course) => course.averageRating >= requiredRating)
      .sort((prev, next) => {
        return prev.averageRating - next.averageRating;
      });
  }

  return {
    courses: listCourses,
    maxPage: Math.ceil(totalCourses / perPage),
    total: totalCourses,
  };
};

// Get detail course
export const getDetailCourseBySlug = async (slug) => {
  const course = await Course.findOne(
    { slug: slug, status: "approved" },
    {
      status: 0,
    }
  ).populate({
    path: "createdBy",
    select: "-hashedPassword -email -provider",
  });

  if (!course)
    throw new ApiError({
      message: "Course not found",
      statusCode: 404,
    });

  // Lấy ra TB cộng rating từ RegisterCourse (các khoá học đã có người học)
  const getAvgRates = RegisterCourse.aggregate([
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
  const getLessons = Lesson.find({
    course: course._id,
  });
  const getPreviewCourse = course.getPreview();

  const [preview, lessons, avgRates] = await Promise.all([
    getPreviewCourse,
    getLessons,
    getAvgRates,
  ]);

  return { ...preview, ...avgRates[0], lessons };
};

// Get avg score each user in 1 course
// Lấy điểm trung bình của người dùng tại 1 khoá học với các câu trả lời đã có điểm (vì có những answer nhưng chưa có điểm vì bài tập dạng code chưa chấm)
export const getScoresInLessonsByIdCourse = async (idCourse) => {
  const listRegisteredCourses = await RegisterCourse.find({
    course: idCourse,
  }).lean();

  const idRegisterCourses = listRegisteredCourses.map((item) => String(item._id));

  const listAvgScoreEachUser = await AnswerRecord.aggregate([
    {
      $match: {
        idRegisteredCourse: {
          $in: idRegisterCourses,
        },
        score: {
          $exists: true,
        },
      },
    },
  ])
    .group({
      _id: "$user",
      totalAnswerRecords: {
        $sum: 1,
      },
      avgScore: {
        $avg: "$score",
      },
    })
    .lookup({
      from: "users",
      localField: "_id",
      as: "user",
      foreignField: "_id",
      pipeline: [
        {
          $project: {
            username: 1,
            avatar: 1,
            school: 1,
            favouriteProrammingLanguages: 1,
          },
        },
      ],
    })
    .unwind("user")
    .sort({
      avgScore: -1,
    });

  const output = listAvgScoreEachUser.map((item) => {
    return {
      ...item,
      user: {
        ...item.user,
        avatar: transformImageUri(item.user.avatar),
      },
    };
  });

  return output;
};

// ======== For user  ========
// Register course by user => Done
export const registerCourse = async (idUser, idCourse) => {
  const now = new Date();
  const course = await Course.findById(idCourse);

  // Check status register
  const isRegistered = await RegisterCourse.exists({
    user: idUser,
    course: idCourse,
  });

  // TH: đã là thành viên của course
  if (isRegistered) {
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
  return savedRegister;
};

// Cancel course by user => Done
export const cancelCourse = async (idUser, idCourse) => {
  // delete register course
  const deletedRegisteredCourse = await RegisterCourse.findOneAndDelete({
    user: idUser,
    course: idCourse,
  });

  if (!deletedRegisteredCourse) {
    throw new ApiError({
      message: "Not found or user exited",
      statusCode: 403,
    });
  }

  const idRegisteredCourse = deletedRegisteredCourse._id;
  await AnswerRecord.deleteMany({
    user: idUser,
    idRegisteredCourse: idRegisteredCourse,
  });
};

// Get registered courses => Done
export const getRegisteredCourses = async (idUser) => {
  // Các khoá học đăng ký mà khoá học chưa xoá
  const listRegisteredCourse = await RegisterCourse.find({
    user: idUser,
  })
    .populate({
      path: "course",
      match: {
        deleted: false,
      },
    })
    .sort({
      updatedAt: -1,
    });

  const filteredRegisteredCourses = listRegisteredCourse.filter((course) => course.course !== null);

  // Danh sách id course trong register course
  const listCourseId = filteredRegisteredCourses.map((register) => {
    return register.course._id;
  });

  // Các bài giảng có course trong danh sách id course
  const lessons = await Lesson.find({
    course: { $in: listCourseId },
  });

  // Tạo 1 object có key là idCourse và value là 1 array chứa danh sách khoá học trong course đó
  const groupLessonsByIdCourse = lessons.reduce((acc, lesson) => {
    const idCourse = lesson.course;
    if (!acc[idCourse]) {
      acc[idCourse] = [lesson._id];
    } else {
      acc[idCourse].push(lesson._id);
    }
    return acc;
  }, {});

  const jsonListRegisteredCourse = JSON.parse(JSON.stringify(filteredRegisteredCourses));

  // Trả về danh sách các khoá học đăng ký, mỗi course sẽ lấy ra id lesson tương ứng
  const output = jsonListRegisteredCourse.map((registerCourse) => {
    return {
      ...registerCourse,
      course: {
        ...registerCourse.course,
        lessons: groupLessonsByIdCourse[registerCourse.course._id] ?? [],
      },
    };
  });
  return output;
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
export const getRegisteredCourse = async ({ idRegisteredCourse, idUser }) => {
  const registeredCourse = await RegisterCourse.findOne({
    _id: idRegisteredCourse,
    user: idUser,
  })
    .populate("course")
    .lean();

  if (!registeredCourse) return null;

  const course = await Course.findById(registeredCourse.course._id).populate(
    "createdBy",
    "username avatar"
  );

  const lessons = await Lesson.find({ course: course }, { _id: 1 });
  registeredCourse.course.lessons = lessons.map((lesson) => lesson._id);
  return {
    ...registeredCourse,
    teacher: course.createdBy,
  };
};

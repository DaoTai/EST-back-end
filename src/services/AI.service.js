import { v4 as uuidv4 } from "uuid";
import AnswerRecord from "~/app/models/AnswerRecord.model";
import Course from "~/app/models/Course.model";
import RegisterCourse from "~/app/models/RegisterCourse.model";
import ApiError from "~/utils/ApiError";

export const oldGetScoresByIdCourse = async (idCourse) => {
  const listRegisteredCourses = await RegisterCourse.find({
    course: idCourse,
  }).lean();

  const idRegisterCourses = listRegisteredCourses.map((item) => String(item._id));
  const listDataArrays = [];
  for (const idRegisterCourse of idRegisterCourses) {
    const avgScores = await AnswerRecord.aggregate([
      {
        $match: {
          idRegisteredCourse: idRegisterCourse,
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
        idRegisteredCourse: {
          $first: "$idRegisteredCourse",
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
              school: 1,
              favouriteProrammingLanguages: 1,
            },
          },
        ],
      })
      .unwind("user")
      .unwind({
        path: "$user.favouriteProrammingLanguages",
        preserveNullAndEmptyArrays: true,
      });

    //   Lấy avg score đầu tiên để lấy thông tin course đó
    for (const avgScore of avgScores) {
      const registerCourse = await RegisterCourse.findById(avgScore.idRegisteredCourse).populate(
        "course"
      );
      const course = registerCourse.course;
      const data = {
        idUser: registerCourse.user,
        courseName: course.name,
        level: course.level,
        courseLanguages: course.programmingLanguages,
        school: avgScore.user.school,
        favouriteProrammingLanguage: avgScore.user.favouriteProrammingLanguages,
        score: avgScore.avgScore.toFixed(2),
        registeredTime: registerCourse.createdAt,
        suitablejob: course.suitableJob,
      };
      const final = data.courseLanguages.map((courseLanguage) => {
        const uniqueId = uuidv4();
        return {
          id: uniqueId,
          language_course: courseLanguage ?? "None",
          love_language: data.favouriteProrammingLanguage ?? "None",
          school: data.school ?? "None",
          idUser: data.idUser,
          level_course: data.level,
          name_course: data.courseName,
          average_score_course: data.score,
          register_course_time: data.registeredTime,
          suitable_job_course: data.suitablejob,
        };
      });

      listDataArrays.push(final);
    }
  }
  const flatData = listDataArrays.reduce((acc, item) => {
    return [...acc, ...item];
  }, []);
  return flatData;
};

export const oldPredictSuitableJobs = async () => {
  const courseIds = await Course.distinct("_id", {});
  const avgScores = [];
  for (const id of courseIds) {
    const avgScore = await oldGetScoresByIdCourse(id);
    avgScores.push(avgScore);
  }
  const flat = avgScores.reduce((acc, item) => {
    return [...acc, ...item];
  }, []);
  return flat;
};

// =======Version 2======

// Lấy điểm trung bình của các học viên trong khoá học
// Trả về 1 mảng chứa item là object điểm trung bình + thông tin khoá học + thông tin user
export const getAvgScoresByRegisterCourseIds = async (registerCourseIds) => {
  // Convert to string[]
  const listRegisterCourseIds = registerCourseIds.map((item) => String(item));
  const listDataArrays = [];
  for (const idRegisterCourse of listRegisterCourseIds) {
    const avgScores = await AnswerRecord.aggregate([
      {
        $match: {
          idRegisteredCourse: idRegisterCourse,
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
        idRegisteredCourse: {
          $first: "$idRegisteredCourse",
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
              school: 1,
              favouriteProrammingLanguages: 1,
            },
          },
        ],
      })
      .unwind("user")
      .unwind({
        path: "$user.favouriteProrammingLanguages",
        preserveNullAndEmptyArrays: true,
      });

    //   Lấy avg score đầu tiên để lấy thông tin course đó
    for (const avgScore of avgScores) {
      const registerCourse = await RegisterCourse.findById(avgScore.idRegisteredCourse).populate(
        "course"
      );

      const course = registerCourse.course;
      const data = {
        idUser: registerCourse.user,
        courseName: course.name,
        level: course.level,
        courseLanguages: course.programmingLanguages,
        school: avgScore.user.school,
        favouriteProrammingLanguage: avgScore.user.favouriteProrammingLanguages,
        score: avgScore.avgScore.toFixed(2),
        registeredTime: registerCourse.createdAt,
        suitablejob: course.suitableJob,
      };
      const final = data.courseLanguages.map((courseLanguage) => {
        const uniqueId = uuidv4();
        return {
          id: uniqueId,
          language_course: courseLanguage ?? "None",
          love_language: data.favouriteProrammingLanguage ?? "None",
          school: data.school ?? "None",
          idUser: data.idUser,
          level_course: data.level,
          name_course: data.courseName,
          average_score_course: data.score,
          register_course_time: data.registeredTime,
          suitable_job_course: data.suitablejob,
        };
      });

      listDataArrays.push(final);
    }
  }
  const flatData = listDataArrays.reduce((acc, item) => {
    return [...acc, ...item];
  }, []);
  return flatData;
};

// Lấy dữ liệu để training
export const getPredictData = async (idUser) => {
  const courseIds = await Course.distinct("_id", {});
  const listRegisteredCourseIds = await RegisterCourse.distinct("_id", {
    course: {
      $in: courseIds,
    },
    user: {
      $ne: idUser,
    },
  });

  const avgScores = await getAvgScoresByRegisterCourseIds(listRegisteredCourseIds);

  return avgScores;
};

export const getAvgScoreInRegisteredCoursesByIdUser = async (idUser) => {
  const registerCourseIds = await RegisterCourse.distinct("_id", {
    user: idUser,
  });
  const myAvgScores = await getAvgScoresByRegisterCourseIds(registerCourseIds);
  return myAvgScores;
};

export const predictSuitableJobs = async ({ data, myAvgScores }) => {
  try {
    const local = "http://127.0.0.1:5000/predict";
    const product = "https://est-edu-ai.onrender.com/predict";
    const response = await fetch(local, {
      method: "POST",
      body: JSON.stringify({
        trainData: data,
        myAvgScores: myAvgScores,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const predict = await response.json();
    return predict;
  } catch (error) {
    throw new ApiError({
      message: error,
      statusCode: 400,
    });
  }
};

import { v4 as uuidv4 } from "uuid";
import AnswerRecord from "~/app/models/AnswerRecord.model";
import Course from "~/app/models/Course.model";
import RegisterCourse from "~/app/models/RegisterCourse.model";

export const getScoresByIdCourse = async (idCourse) => {
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

export const predictSuitableJobs = async () => {
  const courseIds = await Course.distinct("_id", {});
  const avgScores = [];
  for (const id of courseIds) {
    const avgScore = await getScoresByIdCourse(id);
    avgScores.push(avgScore);
  }
  const flat = avgScores.reduce((acc, item) => {
    return [...acc, ...item];
  }, []);
  return flat;
};

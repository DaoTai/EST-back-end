import CourseModel from "~/app/models/Course.model";
import UserModel from "~/app/models/User.model";

export const getOverviewInfor = async () => {
  const getTotalUsers = UserModel.count();
  const getTotalTeachers = UserModel.count({
    roles: {
      $in: ["teacher"],
    },
  });
  const getTotalCourses = CourseModel.count();
  const getProgrammingLanguages = CourseModel.distinct("programmingLanguages");
  const [totalUsers, totalTeachers, totalCourses, programmingLanguages] = await Promise.all([
    getTotalUsers,
    getTotalTeachers,
    getTotalCourses,
    getProgrammingLanguages,
  ]);

  return {
    totalUsers,
    totalTeachers,
    totalCourses,
    totalProgrammingLanguages: programmingLanguages.length,
  };
};

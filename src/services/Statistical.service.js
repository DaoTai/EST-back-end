import CourseModel from "~/app/models/Course.model";
import RegisterCourseModel from "~/app/models/RegisterCourse.model";
import UserModel from "~/app/models/User.model";

// Thống kê các ngôn ngữ lập trình trong các khoá học
export const prorammingLanguages = async () => {
  const data = await CourseModel.aggregate([])
    .project({
      // Đảm bảo cùng định dạng là chữ in hoa
      programmingLanguages: {
        $map: { input: "$programmingLanguages", as: "lang", in: { $toUpper: "$$lang" } },
      },
    })
    .unwind("programmingLanguages")
    .group({
      _id: "$programmingLanguages",
      total: { $sum: 1 },
    })
    .sort({
      total: -1,
    });
  const output = data.map((item) => ({ ...item, name: item._id }));

  return output;
};

// Thống kê các ngôn ngữ lập trình có trong các khoá học được user đăng ký
export const registerByProgrammingLanguages = async () => {
  const data = await RegisterCourseModel.aggregate([])
    .lookup({
      localField: "course",
      as: "course",
      foreignField: "_id",
      from: "courses", // Ref tới model phải có s
    })
    .unwind("course")
    .project({
      // Đảm bảo cùng định dạng là chữ in hoa
      "course.programmingLanguages": {
        $map: { input: "$course.programmingLanguages", as: "lang", in: { $toUpper: "$$lang" } },
      },
    })
    .unwind("course.programmingLanguages")

    .group({
      _id: "$course.programmingLanguages",
      total: { $sum: 1 },
    })
    .sort({
      total: -1,
    });
  const output = data.map((item) => ({ ...item, name: item._id }));
  return output;
};

export const getAllUsers = async () => {
  return await UserModel.find({}, { createdAt: 1, roles: 1, username: 1 });
};

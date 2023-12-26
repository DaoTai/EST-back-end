import CourseModel from "~/app/models/Course.model";
import LessonModel from "~/app/models/Lesson.model";
import LessonCommentModel from "~/app/models/LessonComment.model";
import Notification from "~/app/models/Notifycation.model";
import RegisterCourseModel from "~/app/models/RegisterCourse.model";
import UserModel from "~/app/models/User.model";
import ApiError from "~/utils/ApiError";

// Thông báo tới người dùng:
/*
1. Khoá học đã đăng ký thêm bài giảng mới => Done
2. Có người bình luận bài giảng đã học => Done
3. Admin phê duyệt khoá học => Done
4. Member tham gia khoá học => Done
5. Học viên trả lời bài tập code => Done
*/

// Create
export const createNotification = async (body) => {
  const notify = new Notification(body);
  return await notify.save();
};

// Create notify to members in register course when teacher create new lesson
export const sendNotifyToMembersInCourse = async ({ idUser, lesson }) => {
  const idCourse = lesson.course;
  //   Get list members in course
  const registerCourse = await RegisterCourseModel.find({
    course: idCourse,
  }).lean();
  const listMembers = registerCourse.map((course) => course.user);

  //   Get course to get thumbnail
  const course = await CourseModel.findById(idCourse);

  //   Create notifications
  for (const idMember of listMembers) {
    await createNotification({
      field: "detail-course",
      content: "New lesson: " + lesson.name,
      receiver: idMember,
      sender: idUser,
      endpoint: registerCourse[0]._id,
      avatar: course.getThumbNail(),
    });
  }
};

// Create notify to user passed lessons has comment
export const sendNotifyToLessonComment = async ({ idUser, idLesson }) => {
  //   Get list user comment in lesson
  const users = await LessonCommentModel.distinct("user", {
    lesson: idLesson,
    user: {
      $ne: idUser,
    },
  });

  const sender = await UserModel.findById(idUser);

  //   Create notifications
  for (const idUserComment of users) {
    const registerCourse = await RegisterCourseModel.findOne({
      user: idUserComment,
      passedLessons: { $in: idLesson },
    });
    if (registerCourse) {
      const endpoint = `${registerCourse._id}/${idLesson}`;
      await createNotification({
        field: "lesson-comment",
        content: sender.username + " has comment in lesson",
        avatar: sender.getAvatar(),
        receiver: idUserComment,
        sender: idUser,
        endpoint,
      });
    }
  }
};

// Create notify when approve courses
export const sendNotifyApprovedCoursesToTeacher = async ({ idUser, listIdCourses }) => {
  for (const idCourse of listIdCourses) {
    const course = await CourseModel.findById(idCourse).lean();

    await createNotification({
      field: "approved-course",
      content: "Course: " + course.name + " has approved",
      receiver: course.createdBy,
      sender: idUser,
      endpoint: course._id,
    });
  }
};

// Create notify to teacher when user register course
export const sendNotifyRegisterCourseToTeacher = async ({ idUser, idCourse }) => {
  const [course, user] = await Promise.all([
    CourseModel.findById(idCourse),
    UserModel.findById(idUser),
  ]);

  await createNotification({
    field: "others",
    content: user.username + " has registered course " + course.name,
    receiver: course.createdBy,
    sender: idUser,
  });
};

// Create notify to teacher when member answer code questions
export const sendNotifyMemberAnswerCode = async ({ idUser, question }) => {
  const getLesson = LessonModel.findOne({
    questions: {
      $in: [question._id],
    },
  });

  const getUser = UserModel.findById(idUser);
  const [lesson, user] = await Promise.all([getLesson, getUser]);
  if (!lesson) return;
  const course = await CourseModel.findById(lesson.course).populate("createdBy");
  const teacher = course.createdBy;

  await createNotification({
    field: "answer-code-question",
    content: user.username + " answered " + question.content + " in course " + course.name,
    receiver: teacher,
    sender: idUser,
    endpoint: lesson._id,
  });
};

// Get by user
export const getNotificationsByUser = async ({ idUser, perPage = 8, page = 1 }) => {
  const total = await Notification.count({
    receiver: idUser,
  });

  const totalUnRead = await Notification.count({
    receiver: idUser,
    isRead: false,
  });

  const listNotifications = await Notification.find({
    receiver: idUser,
  })
    .sort({
      createdAt: -1,
    })
    .skip(perPage * page - perPage)
    .limit(perPage);

  return {
    maxPage: Math.ceil(total / perPage),
    totalUnRead,
    listNotifications,
  };
};

// Read
export const readNotifications = async (listIdNotify) => {
  if (!Array.isArray(listIdNotify)) {
    throw new ApiError({
      message: "Invalid values",
      statusCode: 400,
    });
  }
  await Notification.updateMany(
    {
      _id: {
        $in: listIdNotify,
      },
    },
    {
      isRead: true,
    }
  );
};

// Delete list
export const deleteNotification = async (idNotify) => {
  await Notification.deleteOne(idNotify);
};

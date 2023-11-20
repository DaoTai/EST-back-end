import User from "~/app/models/User.model";
import ApiError from "~/utils/ApiError";

export const getListUsers = async ({ perPage, role = "user", page, status }) => {
  const total = await User.count({
    roles: {
      $in: [role],
    },
    deleted: status === "deleted" ? true : false,
  });
  const listUsers = await User.find(
    {
      roles: {
        $in: [role],
      },
      deleted: status === "deleted" ? true : false,
    },
    {
      hashedPassword: 0,
    }
  )
    .skip(perPage * page - perPage)
    .limit(perPage);

  return {
    total,
    listUsers,
    maxPage: Math.ceil(total / perPage),
  };
};

export const getAllUserWithRole = async ({ role = "user", status }) => {
  return await User.find({
    roles: {
      $in: [role],
    },
    deleted: status === "deleted" ? true : false,
  });
};

export const authorizeTeacher = async (option = "authorize", listIdUsers) => {
  const options = ["authorize", "unAuthorize"];
  if (!options.includes(option)) {
    throw new ApiError({
      statusCode: 400,
      message: "Option is invalid",
    });
  }
  if (option === "authorize") {
    await User.updateMany(
      {
        _id: {
          $in: listIdUsers,
        },
        roles: {
          $nin: "teacher",
        },
      },
      {
        $push: { roles: ["teacher"] },
      }
    );
  } else {
    await User.updateMany(
      {
        _id: {
          $in: listIdUsers,
        },
        roles: {
          $in: "teacher",
        },
      },
      {
        $pull: { roles: "teacher" },
      }
    );
  }
};

export const authorizeAccounts = async (option = "block", listIdUsers = []) => {
  const options = ["block", "unBlock"];
  if (!options.includes(option)) {
    throw new ApiError({
      statusCode: 400,
      message: "Option is invalid",
    });
  }
  await User.updateMany(
    {
      _id: {
        $in: listIdUsers,
      },
    },
    {
      deleted: option === "block",
    }
  );
};

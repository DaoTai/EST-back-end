import CV from "~/app/models/CV.model";
import ApiError from "~/utils/ApiError";

// Create
export const createCV = async (body) => {
  const authorizedRoles = ["teacher"];
  const newCV = new CV(body);
  if (!authorizedRoles.includes(newCV.role)) {
    throw new ApiError({ statusCode: 401, message: "Role is unauthorized" });
  }
  const isExist = await CV.findOne({
    user: newCV.user,
    role: newCV.role,
  });

  if (isExist) {
    throw new ApiError({ statusCode: 403, message: "You have sended CV for this role" });
  }
  return await newCV.save();
};

// Edit
export const editCV = async (id, newBody) => {
  return CV.findByIdAndUpdate(id, newBody, {
    new: true,
  });
};

// Delete
export const deleteCV = async (id) => {
  await CV.deleteOne({ _id: id });
};

// Get list CV
export const getListCVs = async (role) => {
  return await CV.find({
    role: role,
  }).populate("user", "-hashedPassword");
};

// Get detail
export const getDetail = async (id) => {
  return await CV.findById(id);
};

// Get by user
export const getDetailByUser = async (idUser) => {
  return await CV.findOne({
    user: idUser,
  });
};

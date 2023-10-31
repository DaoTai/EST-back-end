import mongoose from "mongoose";
import ApiError from "~/utils/ApiError";
import { handleErrorValidation } from "~/utils/validation";

const handlingErrorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.message);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json(handleErrorValidation(err));
  }
  if (err instanceof Error) {
    console.log("Error: ", err);

    return res.status(500).json(err.message);
  }
  return res.status(500).json("Server error");
};

export default handlingErrorMiddleware;

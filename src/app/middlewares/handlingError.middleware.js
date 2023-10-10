import mongoose from "mongoose";
import { handleErrorValidation } from "~/utils/validation";

const handlingErrorMiddleware = (err, req, res, next) => {
  if (err instanceof Error) {
    if (err instanceof mongoose.Error.ValidationError) {
      return res.status(404).json(handleErrorValidation(err));
    }
    return res.status(500).json(err.message);
  }
  return res.status(500).json("Server error");
};

export default handlingErrorMiddleware;

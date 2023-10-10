import mongoose from "mongoose";

// Check email pattern
export const isEmail = (email) => {
  var pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return pattern.test(email);
};

// Handle error validation before save to DB
export const handleErrorValidation = (error) => {
  if (error instanceof mongoose.Error.ValidationError) {
    const message = [];
    const objectError = error.errors;
    for (const value of Object.values(objectError)) {
      message.push(value.message);
    }
    return message;
  }
};

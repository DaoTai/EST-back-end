const verifyTeacher = (req, res, next) => {
  return req.user.roles.includes("teacher")
    ? next()
    : res.status(403).json("You are unauthorized to teacher");
};

export default verifyTeacher;

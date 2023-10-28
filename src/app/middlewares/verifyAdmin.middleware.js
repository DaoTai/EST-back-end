const verifyAdmin = (req, res, next) => {
  return req.user.roles.includes("admin")
    ? next()
    : res.status(403).json("You are unauthorized to admin");
};

export default verifyAdmin;

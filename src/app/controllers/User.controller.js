import UserModel from "../models/User.model";
class UserController {
  // [GET] user/profile/:id
  async getProfile(req, res, next) {
    try {
      console.log("params: ", req.params);
      const user = await UserModel.findById(req.params.id, {
        hashedPassword: 0,
      });

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] user/profile/edit
  async editProfile(req, res, next) {
    const data = req.body;
    const file = req.file;
    if (file) data.avatar = { uri: file.filename, storedBy: "server" };
    try {
      const user = await UserModel.findByIdAndUpdate(req.user._id, data, { new: true });
      res.status(200).json(user.toAuthJSON());
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

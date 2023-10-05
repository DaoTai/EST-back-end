import UserModel from "../models/User.model";
class UserController {
  // [PATCH] /user/change-password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword || currentPassword === newPassword)
        return res.status(400).json("Passwords are invalid");
      if (newPassword.trim().length < 6)
        return res.status(401).json("Password is at least 6 characters");
      const user = await UserModel.findById(req.user._id);
      const isValidPassword = user.isValidPassword(currentPassword, user.hashedPassword);

      if (!isValidPassword) return res.status(401).json("Current password is invalid");

      const newHashedPassword = user.hashPassword(newPassword);

      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
        {
          hashedPassword: newHashedPassword,
        },
        {
          new: true,
        }
      );

      return res.status(201).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

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
    try {
      if (file) {
        const currentUser = await UserModel.findById(req.user._id);
        data.avatar = await currentUser.generateNewAvatar(file);
        await currentUser.deleteAvatar();
      }

      // Update data
      const editedUser = await UserModel.findByIdAndUpdate(req.user._id, data, { new: true });

      res.status(200).json(editedUser.toProfileJSON());
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

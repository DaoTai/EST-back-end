import User from "../models/User.model";
class UserController {
  // [GET] user/profile
  async searchProfile(req, res, next) {
    try {
      const { page: pageQuery, search: searchQuery, role: roleQuery } = req.query;
      const perPage = 12;
      const page = +pageQuery || 1;
      const regex = new RegExp(searchQuery, "i");
      const conditions = [
        {
          _id: { $ne: req.user._id },
        },
        {
          hashedPassword: 0,
        },
      ];
      // Exist query
      if (roleQuery) conditions[0].roles = { $in: [roleQuery] };
      if (searchQuery) conditions[0]["$or"] = [{ username: regex }, { fullName: regex }];
      const users = await User.find(...conditions)
        .skip(perPage * page - perPage)
        .limit(perPage);
      const totalUsers = await User.count(...conditions);

      return res.status(200).json({
        users,
        maxPage: Math.ceil(totalUsers / perPage),
        total: totalUsers,
      });
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/profile/:id
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.params.id, {
        hashedPassword: 0,
      });
      return res.status(200).json(user ? user.toProfileJSON() : user);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /user/change-password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || currentPassword === newPassword)
        return res.status(400).json("Passwords are invalid");
      if (newPassword.trim().length < 6)
        return res.status(401).json("Password is at least 6 characters");
      const user = await User.findById(req.user._id);
      if (!user.hashedPassword) return res.status(403).json("Account doesn't have password");
      const isValidPassword = user.isValidPassword(currentPassword, user.hashedPassword);

      if (!isValidPassword) return res.status(401).json("Current password is invalid");

      const newHashedPassword = user.hashPassword(newPassword);

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          hashedPassword: newHashedPassword,
        },
        {
          new: true,
        }
      );

      return res.status(201).json(updatedUser.toProfileJSON());
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] user/profile
  async editProfile(req, res, next) {
    const data = req.body;
    const file = req.file;
    try {
      if (file) {
        const currentUser = await User.findById(req.user._id);
        data.avatar = await currentUser.generateNewAvatar(file);
        await currentUser.deleteAvatar();
      }

      // Update data
      const editedUser = await User.findByIdAndUpdate(req.user._id, data, { new: true });

      return res.status(200).json(editedUser.toProfileJSON());
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

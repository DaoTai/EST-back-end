import {
  cancelCourse,
  getRegisteredCourse,
  getRegisteredCourses,
  rateCourse,
  registerCourse,
} from "~/services/Course.service";
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

  // [GET] user/courses
  async getOwnerCourses(req, res, next) {
    try {
      const listCourses = await getRegisteredCourses(req.user._id);
      return res.status(200).json(listCourses);
    } catch (error) {
      next(error);
    }
  }

  // [GET] user/courses/:id

  async getOwnerCourse(req, res, next) {
    try {
      const data = await getRegisteredCourse(req.params.id);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // [POST] user/courses/:id
  async registerCourse(req, res, next) {
    try {
      const idCourse = req.params.id;
      const idUser = req.user._id;
      if (!idCourse) return res.status(400).json("Id course is required");
      const data = await registerCourse(idUser, idCourse);
      return res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] user/courses/:id
  async rateCourse(req, res, next) {
    try {
      const { rating } = req.body;
      const idCourse = req.params.id;
      const idUser = req.user._id;
      await rateCourse(idUser, idCourse, rating);
      return res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] user/courses/:id
  async cancelCourse(req, res, next) {
    try {
      const idCourse = req.params.id;
      const idUser = req.user._id;
      if (!idCourse) return res.status(400).json("Id course is required");
      await cancelCourse(idUser, idCourse);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

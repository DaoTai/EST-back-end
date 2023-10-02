import UserModel from "../models/User.model";

class UserController {
  // [POST] user/profile/edit
  async editProfile(req, res, next) {
    const data = req.body;
    try {
      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

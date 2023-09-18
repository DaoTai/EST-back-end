import UserModel from "../models/User.model";

class AuthController {
  // [POST] /auth/register
  signUp(req, res) {
    console.log("Body: ", req.body);
    return res.status(200).json(req.body);
  }
}

export default new AuthController();

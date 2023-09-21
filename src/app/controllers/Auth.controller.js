import User from "../models/User.model";
import { verifyEmailByCaptcha } from "~/services/nodemailer";

// user có 2 cách đăng nhập:
// 1. Provider từ NextAuth
// 2. Theo thông tin đã đăng ký từ hệ thống
class AuthController {
  // [POST] /auth/sign-up
  async signUp(req, res) {
    try {
      const { email, password, fullName, avatar, provider } = req.body;
      if (!email) return res.status(401).json("Email is required field");
      if (!fullName) return res.status(401).json("Full name is required field");

      const user = new User({
        email,
        fullName,
        provider,
        avatar,
      });

      // Check vừa có password vừa có provider: Postman, swagger,...
      if (password && provider) {
        return res.status(401).json("Invalid information");
      }

      // Check user existed
      if (!password && provider) {
        const isExisted = await user.isExistByProvider(email, provider);
        if (isExisted) return res.status(401).json("User is existed. Please using other emails");
      }

      // Nếu user đăng ký theo app (có password)
      if (password && !provider) {
        const isExisted = await user.isExistByPassword(email);
        if (isExisted) {
          return res.status(401).json("User is existed. Please using other emails");
        }
        if (password.length < 6) {
          return res.status(401).json("Password is at least 6 characters");
        }
        user.hashPassword(password);
      }
      const savedUser = await user.save();
      return res.status(200).json(savedUser.toAuthJSON());
    } catch (err) {
      console.log("Error: ", err);
      res.status(500).json(err);
    }
  }

  // [POST] /auth/sign-in
  async signIn(req, res) {
    try {
      const { email, password, provider } = req.body;
      // Check exist email
      if (!email) return res.status(401).json("Email is required field");
      const userLogin = new User({
        email,
      });
      const user = await User.findOne({
        email,
        provider,
      });

      // If user not exist
      if (!user) return res.status(401).json("User is not exist");

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      const data = user.toAuthJSON();
      const payload = {
        ...data,
        accessToken,
        refreshToken,
      };
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
      console.log("Body: ", req.body);
      console.log("User: ", payload);
      // Kiểm tra user đăng nhập theo tài khoản đã đăng ký theo app (có password)
      if (!provider && password && user.hashedPassword) {
        const isValidPwd = userLogin.isValidPassword(password, user.hashedPassword);
        return isValidPwd
          ? res.status(200).json(payload)
          : res.status(401).json("Password is wrong");
      }

      return res.status(200).json(payload);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  // [POST] /auth/check-exist
  async checkExistEmailAndProvider(req, res) {
    const { email, provider } = req.body;
    if (!email || !provider) return res.status(400).json("Invalid information");
    const user = await User.findOne({
      email,
      provider,
    });
    return res.status(200).json(!!user);
  }

  // [POST] /auth/verify-email
  async verifyEmail(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json("Email is required");
    try {
      // Check email existed
      const user = new User({
        email,
      });
      const existed = await user.isExistByPassword(email);
      // Nếu user đã có email đăng ký theo app rồi
      if (existed) return res.status(403).json("Email is existed. Please using other emails");
      const result = await verifyEmailByCaptcha(email);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new AuthController();

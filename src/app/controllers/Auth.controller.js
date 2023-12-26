import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { verifyEmailByCaptcha, sendNewPassword } from "~/utils/nodemailer";
import env from "~/utils/environment";
import UserModel from "../models/User.model";

// user có 2 cách đăng nhập:
// 1. Provider từ NextAuth
// 2. Theo thông tin đã đăng ký từ hệ thống
class AuthController {
  // [POST] /auth/sign-up
  async signUp(req, res, next) {
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
        // Kiểm tra user đã tồn tại?
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
      return res.status(201).json(savedUser.toProfileJSON());
    } catch (err) {
      next(err);
    }
  }

  // [POST] /auth/sign-in
  async signIn(req, res, next) {
    try {
      const { email, password, provider } = req.body;
      // typeof email !== "string": check email phải là string => tránh sql injection
      if (!email || typeof email !== "string")
        return res.status(400).json("Email is required field");
      if ((!password && !provider) || (password && provider))
        return res.status(400).json("Sign in invalid");

      // Đăng nhập bởi Next-Auth
      if (provider) {
        const user = await User.findOne({
          email,
          provider,
          deleted: false,
        });
        if (!user) return res.status(401).json("User is not exist");
        return res.status(200).json(user.toAuthJSON());
      } else {
        // Đăng nhập theo tài khoản đã đăng ký theo app (có password)
        const userLogin = new User({
          email,
        });

        const user = await User.findOne({
          email,
          deleted: false,
          hashedPassword: {
            $exists: true,
          },
        });

        if (!user) return res.status(401).json("User is not exist");
        const isValidPwd = userLogin.isValidPassword(password, user.hashedPassword);
        return isValidPwd
          ? res.status(200).json(user.toAuthJSON())
          : res.status(401).json("Password is wrong");
      }
    } catch (err) {
      next(err);
    }
  }

  // [POST] /auth/exist-email-and-provider
  async checkExistEmailAndProvider(req, res, next) {
    const { email, provider } = req.body;
    if (!email || !provider) return res.status(400).json("Invalid information");
    const user = await User.findOne({
      email,
      provider,
    });
    return res.status(200).json(!!user);
  }

  // [POST] /auth/verify-email
  async verifyEmail(req, res, next) {
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
      console.log("result: ", result);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // [POST] /auth/forgot-password
  async getNewPassword(req, res, next) {
    const { email } = req.body;
    try {
      if (!email) return res.status(400).json("Email is required");
      const user = new User({ email });
      const exist = await user.isExistByPassword(email);
      if (!exist) return res.status(401).json("User is not exist");
      const newPassword = await sendNewPassword(email);
      const newUser = await User.updateOne(
        {
          email,
          hashedPassword: {
            $exists: true,
          },
        },
        {
          hashedPassword: user.hashPassword(newPassword),
        }
      );
      return res.status(200).json(true);
    } catch (err) {
      next(err);
    }
  }

  // [POST] /auth/refresh-token
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.body?.refreshToken;
      if (!refreshToken) return res.status(401).json("You are unauthenticated");
      const decodedRefreshToken = jwt.verify(refreshToken, env.JWT_REFRESH_TOKEN);

      // Success decode refresh token
      const user = new UserModel(decodedRefreshToken);
      const newAccessToken = user.generateAccessToken();
      const newRefreshToken = user.generateRefreshToken();

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.log("Error: ", error);
      // Token hết hạn
      return res.status(403).json("Refresh token is invalid");
    }
  }
}

export default new AuthController();

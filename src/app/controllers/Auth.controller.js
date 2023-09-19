import User from "../models/User.model";

class AuthController {
  // [POST] /auth/sign-up
  async signUp(req, res) {
    try {
      const { email, password, fullName, provider } = req.body;
      if (!email) return res.status(401).json("Email is required field");
      if (!fullName) return res.status(401).json("Full name is required field");
      // Vì user có 2 cách đăng nhập:
      // 1. Provider từ NextAuth
      // 2. Theo thông tin đã đăng ký từ hệ thống
      const user = new User({
        email,
        fullName,
        provider,
      });

      // Check vừa có password vừa có provider: Postman, swagger,...
      if (password && provider) {
        return res.status(401).json("Invalid information");
      }
      // Check email existed
      if (await user.isExistEmail(email)) return res.status(401).json("Email is existed");

      // Nếu user đăng ký theo app (có password)
      if (password && !provider) {
        if (password.length < 6) return res.status(401).json("Password is at least 6 characters");
        user.hashPassword(password);
      }
      const savedUser = await user.save();
      return res.status(200).json(savedUser.toAuthJSON());
    } catch (err) {
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
      const user = await User.findOne(
        {
          email,
        },
        { hashedPassword: 0 }
      );
      // If user not exist
      if (!user) return res.status(401).json("User is not exist");
      // Kiểm tra user đăng nhập theo tài khoản đã đăng ký theo app (có password)
      if (password) {
        const isValidPwd = userLogin.isValidPassword(password, user.hashedPassword);
        return isValidPwd ? res.status(401).json(user) : res.status(401).json("Password is wrong");
      }
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      const payload = {
        ...user._doc,
        accessToken,
        refreshToken,
      };
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
      return res.status(200).json(payload);
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

export default new AuthController();

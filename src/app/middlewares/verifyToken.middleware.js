import jwt from "jsonwebtoken";
import { env } from "~/utils/environment";

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    if (token) {
      // jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, data) => {
      //   if (err) {
      //     return res.status(403).json({ msg: "Token is not valid" });
      //   }
      //   req.user = data;
      //   next();
      // });
      const accessToken = token.split(" ")[1];
      console.log("accessToken: ", accessToken);

      const decoded = jwt.verify(accessToken, env.JWT_ACCESS_TOKEN);
      console.log("decoded: ", decoded);
      req.user = decoded;
      next();
    } else {
      return res.status(401).json("You are unauthenticated");
    }
  } catch (error) {
    return res.status(403).json("Token is invalid");
  }
};

export default verifyToken;

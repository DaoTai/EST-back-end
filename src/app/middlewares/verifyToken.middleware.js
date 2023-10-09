import jwt from "jsonwebtoken";
import env from "~/utils/environment";

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    if (token) {
      const accessToken = token.split(" ")[1];
      const decoded = jwt.verify(accessToken, env.JWT_ACCESS_TOKEN);
      req.user = decoded;
      next();
    } else {
      return res.status(401).json("You are unauthenticated");
    }
  } catch (error) {
    // console.log("Error access token: ", error);
    return res.status(403).json("Access token is invalid");
  }
};

export default verifyToken;

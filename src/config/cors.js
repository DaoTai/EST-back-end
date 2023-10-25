import { WHITE_LIST_DOMAINS } from "~/utils/constants";
import env from "~/utils/environment";
export const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép việc gọi API bằng POSTMAN trên môi trường dev,
    // Thông thường khi sử dụng postman thì cái origin sẽ có giá trị là undefined
    if (!origin && env.BUILD_MODE === "dev") {
      return callback(null, true);
    }

    // Kiểm tra dem origin có phải là domain được chấp nhận hay không
    if (WHITE_LIST_DOMAINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`${origin} not allowed `));
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request, (jwt access token và refresh token vào httpOnly Cookies)
  credentials: true,
};

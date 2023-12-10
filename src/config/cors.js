import env from "~/utils/environment";
import ApiError from "~/utils/ApiError";
import { WHITE_LIST_DOMAINS } from "~/utils/constants";

export const corsOptions = {
  origin: function (origin, callback) {
    // console.log("Origin: ", origin);
    // Cho phép việc gọi API bằng POSTMAN trên môi trường dev,
    // Thông thường khi sử dụng postman thì cái origin sẽ có giá trị là undefined
    if (!origin && env.BUILD_MODE === "dev") {
      return callback(null, true);
    }

    // Kiểm tra dem origin có phải là domain được chấp nhận hay không
    if (WHITE_LIST_DOMAINS.includes(origin)) {
      return callback(null, true);
    }

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(
      new ApiError({
        statusCode: 403,
        message: `${origin} not allowed by our CORS Policy.`,
      })
    );
  },
  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,
};

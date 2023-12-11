import env from "~/utils/environment";
// Các domain được truy cập tài nguyên server
export const WHITE_LIST_DOMAINS = [env.LOCAL_DEV_FE_URI, env.PRODUCTION_FE_URI];
export const QUESTIONS_CATEGORIES = ["code", "choice", "multiple-choice"];
export const GROUP_CHAT_STATUS_MEMBER = ["block", "unblock"];

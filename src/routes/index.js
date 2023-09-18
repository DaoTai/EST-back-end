import authRoute from "./auth.route";
const route = (app) => {
  app.use("/auth", authRoute);
};

export default route;

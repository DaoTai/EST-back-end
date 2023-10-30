import { Router } from "express";
import AdminController from "~/app/controllers/Admin.controller";

const route = Router();

route.route("/courses").get(AdminController.getCoures).patch(AdminController.approveCourses);
route
  .route("/courses/:id")
  .patch(AdminController.toggleApproveCourse)
  .delete(AdminController.deleteCourse);

export default route;

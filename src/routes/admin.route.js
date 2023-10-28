import { Router } from "express";
import AdminController from "~/app/controllers/Admin.controller";

const route = Router();

route.route("/courses").get(AdminController.getCoures).patch(AdminController.approveCourses);

export default route;

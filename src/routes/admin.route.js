import { Router } from "express";
import AdminController from "~/app/controllers/Admin.controller";

const route = Router();

// Users
route.route("/users").get(AdminController.getListsUsers).patch(AdminController.authorize);

// Courses
route.route("/courses").get(AdminController.getCoures).patch(AdminController.approveCourses);
route
  .route("/courses/:id")
  .patch(AdminController.toggleApproveCourse)
  .delete(AdminController.deleteCourse);
// CV
route.route("/cvs").get(AdminController.getListCvs).delete(AdminController.deleteCvs);
export default route;

// Questions
route.get("/questions", AdminController.getQuestions);
route.delete("/questions/:id", AdminController.deleteQuestion);

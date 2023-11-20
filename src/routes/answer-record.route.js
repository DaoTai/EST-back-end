import { Router } from "express";
import AnswerRecordController from "~/app/controllers/AnswerRecord.controller";

const route = Router();

// Users
route.get("/by-question/:idQuestion", AnswerRecordController.getAnswerRecords);
route.patch("/:id", AnswerRecordController.updateAnswerRecord);
export default route;

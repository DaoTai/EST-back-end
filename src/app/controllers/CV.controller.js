import { createCV, deleteCV, editCV, getDetail, getDetailByUser } from "~/services/CV.service";

class CVController {
  // [POST] /cv
  async create(req, res, next) {
    try {
      const newCV = await createCV({
        ...req.body,
        user: req.user._id,
      });
      return res.status(201).json(newCV);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /cv/byUser
  async getByUser(req, res, next) {
    try {
      const detail = await getDetailByUser(req.user._id);
      return res.status(200).json(detail);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /cv/:id
  async get(req, res, next) {
    try {
      const detail = await getDetail(req.params.id);
      return res.status(200).json(detail);
    } catch (error) {
      next(error);
    }
  }
  // [PUT] /cv/:id
  async edit(req, res, next) {
    try {
      const updatedCV = await editCV(req.params.id, req.body);
      return res.status(200).json(updatedCV);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /cv/:id
  async delete(req, res, next) {
    try {
      await deleteCV(req.params.id);
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new CVController();

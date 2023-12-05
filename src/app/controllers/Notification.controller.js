import { getNotificationsByUser, readNotifications } from "~/services/Notification.service";

class NotificationController {
  // [GET] /user?page
  async getByUser(req, res, next) {
    try {
      const page = +req.query.page || 1;
      const result = await getNotificationsByUser({
        idUser: req.user._id,
        page,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /user
  async read(req, res, next) {
    try {
      const listIds = req.body.listIds;
      await readNotifications(listIds);
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();

import { createChat, deleteChat, getListChatByIdGroupChat } from "~/services/Chat.service";
import { editGroupChat } from "~/services/GroupChat.service";

class ChatController {
  // [GET] chat/group-chat/:idGroupChat
  async getByGroupChat(req, res, next) {
    try {
      const idGroupChat = req.params.idGroupChat;
      const page = +req.query.page || 1;
      const perPage = 10;
      const result = await getListChatByIdGroupChat({
        idGroupChat,
        page,
        perPage,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [POST] chat/group-chat/:idGroupChat
  async create(req, res, next) {
    try {
      const idUser = req.user._id;
      const idGroupChat = req.params.idGroupChat;
      const files = req.files;
      const newChat = await createChat({
        ...req.body,
        idGroupChat,
        sender: req.user._id,
        files,
      });
      // Update new latest message
      await editGroupChat({
        idGroupChat,
        idChat: newChat._id,
        idUser,
      });
      return res.status(201).json(newChat);
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] chat/:id
  async delete(req, res, next) {
    try {
      const idChat = req.params.id;
      const idUser = req.user._id;

      await deleteChat({ idChat, idUser });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new ChatController();

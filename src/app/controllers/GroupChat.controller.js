import {
  addMembers,
  appendSeenToChat,
  blockMember,
  cancelGroupChat,
  createGroupChatByUser,
  deleteGroup,
  editGroupChat,
  getDetailGroupChat,
  getListGroupChatByUser,
  removeMember,
  unBlockMember,
} from "~/services/GroupChat.service";
import { GROUP_CHAT_STATUS_MEMBER } from "~/utils/constants";

class GroupChatController {
  // Common role
  // [GET] /group-chat?page
  async get(req, res, next) {
    try {
      const name = req.query.name;
      const result = await getListGroupChatByUser({
        idUser: req.user._id,
        name,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // [POST] /group-chat
  async createByUser(req, res, next) {
    try {
      const { name, idMembers } = req.body;
      if (!name) return res.status(400).json("Name is required");
      const groupChat = await createGroupChatByUser({ idUser: req.user._id, idMembers, name });
      return res.status(200).json(groupChat);
    } catch (error) {
      next(error);
    }
  }

  // [GET] /group-chat/:id
  async getDetail(req, res, next) {
    try {
      const idGroupChat = req.params.id;
      const idUser = req.user._id;
      const groupchat = await getDetailGroupChat({ idGroupChat, idUser });
      return res.status(200).json(groupchat);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /group-chat/:id
  async edit(req, res, next) {
    try {
      const idGroupChat = req.params.id;
      const { name, latestMessage } = req.body;
      await editGroupChat({ idGroupChat, name, latestMessage });
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /group-chat/:id/seen
  async seenLatestChat(req, res, next) {
    try {
      const idGroupChat = req.params.id;
      const idMember = req.user._id;
      await appendSeenToChat({ idGroupChat, idMember });
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  //   [DELETE] /group-chat/:id/cancel
  async cancel(req, res, next) {
    try {
      const idGroupChat = req.params.id;
      const idUser = req.user._id;
      await cancelGroupChat({ idUser, idGroupChat });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  // ==============HOST==============
  // [POST] /group-chat/:id/members
  async addMembers(req, res, next) {
    try {
      const groupChat = req.groupChat;
      const idUser = req.user._id;
      const idGroupChat = req.params.id;
      const { idMembers } = req.body;
      if (!idMembers || !Array.isArray(idMembers) || idMembers.length === 0) {
        return res.status(400).json("Empty new members");
      }
      await addMembers({
        idMembers,
        idUser,
        idGroupChat,
        groupChat,
      });
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /group-chat/:id/members/:idMember?option
  //   Block or Unblock members
  async handleStatusBlockMember(req, res, next) {
    try {
      const groupChat = req.groupChat;
      const idUser = req.user._id;
      const idGroupChat = req.params.id;
      const idMember = req.params.idMember;
      const option = req.query.option;

      if (!idMember || !option || !idGroupChat) {
        return res.status(400).json("Invalid payload");
      }

      if (idMember === idUser) {
        return res.status(403).json("Host cannot handle");
      }

      if (GROUP_CHAT_STATUS_MEMBER.includes(option)) {
        if (option === "block") {
          await blockMember({
            idGroupChat,
            idMember,
            idUser,
            groupChat,
          });
          return res.sendStatus(200);
        }

        if (option === "unblock") {
          await unBlockMember({
            idGroupChat,
            idMember,
            idUser,
            groupChat,
          });
          return res.sendStatus(200);
        }
      } else {
        return res.status(400).json("Option is invalid");
      }
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /group-chat/:id/members/:idMember
  async deleteMember(req, res, next) {
    try {
      const idUser = req.user._id;
      const idGroupChat = req.params.id;
      const idMember = req.params.idMember;
      if (!idMember) return res.status(400).json("Id member is required");
      await removeMember({
        idUser,
        idGroupChat,
        idMember,
      });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  //   [DELETE] /group-chat/:id
  async delete(req, res, next) {
    try {
      await deleteGroup({
        idUser: req.user._id,
        idGroupChat: req.params.id,
      });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export default new GroupChatController();

import GroupChatModel from "../models/GroupChat.model";

// Checking real host
const verifyHost = async (req, res, next) => {
  try {
    const idGroupChat = req.params.id;
    const idUser = req.user._id;
    if (!idGroupChat) {
      return res.status(40).json("Id group chat is required");
    }
    if (!idUser) {
      return res.status(40).json("Id user is required");
    }
    const groupChat = await GroupChatModel.findOne({
      _id: idGroupChat,
      host: idUser,
    });

    if (groupChat) {
      req.groupChat = groupChat;
      next();
    } else {
      return res.status(401).json("You are not host");
    }
  } catch (error) {
    next(error);
  }
};

export default verifyHost;

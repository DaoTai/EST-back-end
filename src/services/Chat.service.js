import Chat from "~/app/models/Chat.model";
import GroupChat from "~/app/models/GroupChat.model";
import { getSEOByURL } from "~/utils/SEO";
import { getUrl } from "~/utils/functions";

// Pagination + Get chats by group chat
export const getListChatByIdGroupChat = async ({ idGroupChat, perPage = 10, page = 1 }) => {
  const total = await Chat.count({
    idGroupChat: idGroupChat,
  });

  const listChats = await Chat.find({
    idGroupChat: idGroupChat,
  })
    .populate("sender", "username avatar")
    .sort({
      createdAt: -1,
    })
    .skip(perPage * page - perPage)
    .limit(perPage);

  return {
    page,
    listChats,
    maxPage: Math.ceil(total / perPage),
  };
};

// Create new chat
export const createChat = async ({ idGroupChat, sender, message, files = [] }) => {
  const chat = new Chat({
    idGroupChat,
    sender,
    message,
  });

  if (message) {
    // Get signgle url in message
    const url = getUrl(message);
    // Get SEO in url
    if (url) {
      const seo = await getSEOByURL(url);
      if (seo) {
        chat.seo = seo;
      }
    }
  }
  // Handle upload file to cloudinary
  if (files && files.length > 0) {
    await chat.uploadAttachments(files);
  }
  const saved = await chat.save();
  const detail = await saved.populate("sender", "avatar username");

  // Update new latest chat in group chat
  await GroupChat.updateOne(
    {
      _id: idGroupChat,
    },
    {
      latestChat: saved._id,
      latestReadBy: [sender],
    }
  );
  return detail;
};

// Delete chat: onyly user is sender can delete their chat
export const deleteChat = async ({ idChat, idUser }) => {
  const chat = await Chat.findOneAndDelete({
    _id: idChat,
    sender: idUser,
  });
  if (chat && chat.attachments.length > 0) {
    await chat.deleteAttachments();
  }
};

// Delete chat by group chat
export const deleteChatByIdGroupChat = async (idGroupChat) => {
  const listChat = await Chat.find({
    idGroupChat,
  });
  const listIds = listChat.map((chat) => chat._id);

  for (const idChat of listIds) {
    await deleteChat(idChat);
  }
};

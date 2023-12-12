import Chat from "~/app/models/Chat.model";
import GroupChat from "~/app/models/GroupChat.model";
import ApiError from "~/utils/ApiError";
import { getSEOByURL } from "~/utils/SEO";
import { getUrl } from "~/utils/functions";

// Pagination + Get chats by group chat
export const getListChatByIdGroupChat = async ({ idGroupChat, perPage = 10, page = 1, idUser }) => {
  // Checking user is member in group chat
  const isMember = await GroupChat.exists({
    _id: idGroupChat,
    members: {
      $in: [idUser],
    },
  });

  if (!isMember) {
    throw new ApiError({
      message: "You don't have permission to see chat",
      statusCode: 401,
    });
  }

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
  const isBlocked = await GroupChat.exists({
    blockedMembers: { $in: [sender] },
  });

  if (isBlocked) {
    throw new ApiError({
      statusCode: 401,
      message: "You are blocked by host",
    });
  }

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
export const deleteListChatByIdGroupChat = async (idGroupChat) => {
  const listChatIds = await Chat.distinct("_id", {
    idGroupChat,
  });

  for (const idChat of listChatIds) {
    const chat = await Chat.findOneAndDelete({
      _id: idChat,
    });
    if (chat && chat.attachments.length > 0) {
      await chat.deleteAttachments();
    }
  }
};

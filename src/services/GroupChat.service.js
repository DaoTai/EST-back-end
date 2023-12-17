import GroupChat from "~/app/models/GroupChat.model";
import ApiError from "~/utils/ApiError";
import { getUniqueValuesInArray } from "~/utils/functions";
import { deleteListChatByIdGroupChat } from "./Chat.service";

// ===========USER===============
// Get list group chat by id user
export const getListGroupChatByUser = async ({ idUser, name }) => {
  const condition = {};
  if (name) condition.name = new RegExp(name, "i");
  const listGroupChats = await GroupChat.find({
    ...condition,
    members: {
      $in: [idUser],
    },
  })
    .populate("host", "avatar")
    .populate("members", "avatar")
    .populate("blockedMembers", "username avatar")
    .populate("latestChat.chat")
    .populate({
      path: "latestChat",
      populate: {
        path: "sender",
        select: "username",
      },
    })
    .sort({
      "latestChat.updated": -1,
      updatedAt: -1,
    });

  return listGroupChats;
};

// Get detail group chat
export const getDetailGroupChat = async ({ idGroupChat, idUser }) => {
  const groupChat = await GroupChat.findOne({
    _id: idGroupChat,
    members: {
      $in: [idUser],
    },
  })
    .populate("host", "username avatar")
    .populate("members", "username avatar favouriteProrammingLanguages")
    .populate("latestReadBy", "username avatar")
    .populate("blockedMembers", "username avatar");
  // No exist
  if (!groupChat) {
    throw new ApiError({
      statusCode: 401,
      message: "You are not member in group chat",
    });
  }

  // Checking user seen
  const isSeen = groupChat.latestReadBy.some((member) => member._id === idUser);
  if (!isSeen) {
    await GroupChat.updateOne(
      {
        _id: idGroupChat,
      },
      {
        $addToSet: {
          latestReadBy: idUser,
        },
      }
    );
  }
  return groupChat;
};

// Create new group chat by user
export const createGroupChatByUser = async ({ idUser, idMembers, name }) => {
  if (!Array.isArray(idMembers)) {
    throw new ApiError({
      statusCode: 400,
      message: "List id members are invalid",
    });
  }

  if (idMembers.length === 0) {
    throw new ApiError({
      statusCode: 400,
      message: "Created group chat is at least 2 members",
    });
  }

  const uniqueIdMembers = getUniqueValuesInArray([...idMembers, idUser]);
  const newGroupChat = new GroupChat({
    name,
    host: idUser,
    members: uniqueIdMembers,
  });

  return await newGroupChat.save();
};

// Update seen users to chat
export const appendSeenToChat = async ({ idGroupChat, idMember }) => {
  const groupChat = await GroupChat.findById(idGroupChat);
  const isSeen = groupChat.latestReadBy.includes(idMember);

  // Update new latest seen chat in group chat

  if (!isSeen) {
    await GroupChat.updateOne(
      {
        _id: idGroupChat,
      },
      {
        $push: {
          latestReadBy: idMember,
        },
      }
    );
  }
};

// Cancel group: host cannot be canceled group chat
export const cancelGroupChat = async ({ idUser, idGroupChat }) => {
  const groupChat = await GroupChat.findById(idGroupChat);
  const host = String(groupChat.host);

  if (host === idUser) {
    throw new ApiError({
      statusCode: 403,
      message: "Host cannot be cancel group chat",
    });
  }

  await GroupChat.updateOne(
    {
      _id: idGroupChat,
      host: {
        $ne: idUser, // NOT HOST
      },
    },
    {
      $pull: {
        members: idUser,
        blockedMembers: idUser,
      },
    }
  );
};

// Edit group: name, latest message
export const editGroupChat = async ({ idGroupChat, name, idChat, idUser }) => {
  // Only not blocked members have author
  if (name) {
    await GroupChat.updateOne(
      {
        _id: idGroupChat,
        blockedMembers: {
          $nin: [idUser],
        },
      },
      {
        name: name,
      }
    );
  }

  if (idChat) {
    await GroupChat.updateOne(
      {
        _id: idGroupChat,
        blockedMembers: {
          $nin: [idUser],
        },
      },
      {
        latestChat: idChat,
      },
      {
        new: true,
      }
    );
  }
};

//  ===========HOST===============
//  add member
export const addMembers = async ({ idUser, idGroupChat, idMembers, groupChat }) => {
  if (!Array.isArray(idMembers)) {
    throw new ApiError({
      statusCode: 400,
      message: "List id members are invalid",
    });
  }
  const uniqueIds = getUniqueValuesInArray(idMembers);
  const existedMembers = groupChat.members;
  // Only get id not exist before
  const validIds = uniqueIds.filter((id) => !existedMembers.includes(id));
  if (validIds.length === 0) {
    throw new ApiError({
      statusCode: 400,
      message: "List id members are existed in group chat",
    });
  } else {
    await GroupChat.updateOne(
      {
        _id: idGroupChat,
        host: idUser,
      },
      {
        $push: {
          members: {
            $each: validIds,
          },
        },
      }
    );
  }
};
// remove member
export const removeMember = async ({ idUser, idGroupChat, idMember }) => {
  if (idUser === idMember) {
    throw new ApiError({
      statusCode: 403,
      message: "Host cannot delete themselves",
    });
  }

  await GroupChat.updateOne(
    {
      _id: idGroupChat,
      host: idUser,
    },
    {
      $pull: {
        members: idMember,
        blockedMembers: idMember,
      },
    }
  );
};

// block members
export const blockMember = async ({ idUser, idGroupChat, idMember, groupChat }) => {
  if (idUser === idMember) {
    throw new ApiError({
      statusCode: 403,
      message: "Host cannot block themselves",
    });
  }
  const isBlocked = groupChat.blockedMembers.includes(idMember);
  if (isBlocked) {
    throw new ApiError({
      statusCode: 403,
      message: "Member was blocked before",
    });
  }

  await GroupChat.updateOne(
    {
      _id: idGroupChat,
      host: idUser,
      blockedMembers: {
        $nin: [idUser],
      },
    },
    {
      $push: {
        blockedMembers: idMember,
      },
    }
  );
};

// unblock members
export const unBlockMember = async ({ idUser, idGroupChat, idMember, groupChat }) => {
  await GroupChat.updateOne(
    {
      _id: idGroupChat,
      host: idUser,
    },
    {
      $pull: {
        blockedMembers: idMember,
      },
    }
  );
};

// delete group
export const deleteGroup = async ({ idUser, idGroupChat }) => {
  await deleteListChatByIdGroupChat(idGroupChat);

  await GroupChat.deleteOne({
    _id: idGroupChat,
    host: idUser,
  });
};

import GroupChat from "~/app/models/GroupChat.model";
import ApiError from "~/utils/ApiError";
import { getUniqueValuesInArray } from "~/utils/functions";

// ===========USER===============
// Get list group chat by id user
export const getListGroupChatByUser = async ({ idUser, perPage = 5, page, name }) => {
  const condition = {
    host: idUser,
  };

  if (name) condition.name = new RegExp(name, "i");

  const total = await GroupChat.count(condition);

  const listGroupChats = await GroupChat.find(condition)
    .sort({
      updatedAt: -1,
    })
    .skip(perPage * page - perPage)
    .limit(perPage);
  return {
    listGroupChats,
    total,
    maxPage: Math.ceil(total / perPage),
  };
};

// Get detail group chat
export const getDetailGroupChat = async (idGroupChat) => {
  const groupChat = await GroupChat.findById(idGroupChat)
    .populate("members", "username avatar")
    .populate("blockedMembers", "username avatar");
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

// Cancel group: host cannot be canceled group chat
export const cancelGroupChat = async ({ idUser, idGroupChat }) => {
  const groupChat = await GroupChat.findById(idGroupChat);
  const host = String(groupChat.host);
  console.log("groupChat: ", groupChat);
  console.log("id user: ", idUser);
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
      },
    }
  );
};

// Edit group: name, latest message
export const editGroupChat = async ({ idGroupChat, name, latestMessage }) => {
  if (name) {
    await GroupChat.updateOne(
      {
        _id: idGroupChat,
      },
      {
        name: name,
      }
    );
  }

  if (latestMessage) {
    // Chưa đụng tới
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
      message: "Member is blocked before",
    });
  }

  await GroupChat.updateOne(
    {
      _id: idGroupChat,
      host: idUser,
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
  await GroupChat.deleteOne({
    _id: idGroupChat,
    host: idUser,
  });
};

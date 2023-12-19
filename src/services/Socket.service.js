import { Server } from "socket.io";
class Socket {
  group = {};
  videoRoom = {};
  constructor(app) {
    this.io = new Server(app, {
      cors: {
        origin: "*",
      },
    });
  }

  // Add user to video room
  addUserToVideoRoom = (room, newUser) => {
    const isExist = room.some((user) => user.socketId === newUser.socketId);
    !isExist && room.push(newUser);
  };

  // Add user to group chat
  addUserToGroup = (group, newIdUser) => {
    const isExist = group.some((idUser) => idUser === newIdUser);
    !isExist && group.push(newIdUser);
  };

  // ==========Chat room===============
  chat() {
    this.io.on("connection", (socket) => {
      socket.on("join group", ({ idGroup }) => {
        const idUser = socket.id;
        socket.join(idGroup);
        if (Array.isArray(this.group[idGroup])) {
          this.addUserToGroup(this.group[idGroup], idUser);
        } else {
          this.group[idGroup] = [idUser];
        }
      });

      socket.on("send chat", ({ idGroup, chat }) => {
        socket.to(idGroup).emit("receive chat", chat);
      });

      socket.on("disconnect", () => {
        const listGroups = Object.keys(this.group);
        listGroups.forEach((item) => {
          // this.group[item] = this.group[item].filter((id) => id !== socket.id);
          socket.leave(this.group[item]);
        });
      });
    });
  }

  // ==========Video room===============
  videoCall() {
    this.io.on("connection", (socket) => {
      // Join room
      socket.on("join video", (data) => {
        // Data: id group-chat, user(avatar, username)
        const { idGroupChat, user } = data;
        if (!idGroupChat || !user) return;
        const newUser = {
          socketId: socket.id,
          ...user,
        };
        const idVideoRoom = idGroupChat + "-video";
        socket.join(idVideoRoom);
        if (Array.isArray(this.videoRoom[idVideoRoom])) {
          this.addUserToVideoRoom(this.videoRoom[idVideoRoom], newUser);
        } else {
          this.videoRoom[idVideoRoom] = [newUser];
        }

        // Trả về danh sách người dùng tham gia
        const listUsers = this.videoRoom[idVideoRoom].filter(
          (item) => item.socketId !== newUser.socketId
        );
        socket.emit("all users", listUsers);
      });

      // Send signal
      socket.on("send signal", (payload) => {
        // Payload: userId, callerId, signal (in WebRTC), user
        // console.log("My socket id: ", socket.id);
        const { friendSocketId, callerId, signal, user } = payload;
        // console.log("Friend id: ", userId);
        // console.log("Caller id: ", callerId);
        this.io.to(friendSocketId).emit("user join", {
          signal,
          callerId,
          user,
        });
      });

      // Return signal
      socket.on("return signal", (payload) => {
        const { callerId, signal } = payload;
        this.io.to(callerId).emit("receive returned signal", {
          signal,
          socketId: socket.id,
        });
      });

      // Disconnect
      socket.on("disconnect", () => {
        const videoRooms = Object.keys(this.videoRoom);
        videoRooms.forEach((videoRoom) => {
          // const users = [...this.videoRoom[videoRoom]];
          const users = this.videoRoom[videoRoom];
          this.videoRoom[videoRoom] = users.filter((user) => {
            return user.socketId !== socket.id;
          });
          socket.to(videoRoom).emit("leaved friend", socket.id);
        });
      });
    });
  }

  run() {
    this.chat();
    this.videoCall();
  }
}

export default Socket;

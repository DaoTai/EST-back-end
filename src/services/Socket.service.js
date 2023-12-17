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
    const isExist = room.some((user) => user.id === newUser.id);
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
        // Data: id group-chat, user(id, avatar, username)
        const { idGroupChat, user } = data;

        if (!idGroupChat || !user) return;

        const idVideoRoom = idGroupChat + "-video";
        socket.join(idVideoRoom);
        if (Array.isArray(this.videoRoom[idVideoRoom])) {
          this.addUserToVideoRoom(this.videoRoom[idVideoRoom], user);
        } else {
          this.videoRoom[idVideoRoom] = [user];
        }

        // Trả về danh sách người dùng tham gia
        const listUsers = this.videoRoom[idVideoRoom].filter((item) => item.id !== user.id);
        console.log("Danh sách friend đã join: ", listUsers);
        socket.emit("all users", listUsers);
      });

      // Send signal
      socket.on("send signal", (payload) => {
        // Payload: userId, callerId, signal (in WebRTC)
        const { userId, callerId, signal } = payload;
        this.io.to(userId).emit("user join", {
          signal,
          callerId,
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
      socket.on("disconnect", () => {});
    });
  }

  run() {
    this.chat();
    this.videoCall();
  }
}

export default Socket;

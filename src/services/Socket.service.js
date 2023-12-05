import { Server } from "socket.io";
class Socket {
  group = {};

  constructor(app) {
    this.io = new Server(app, {
      cors: {
        origin: "*",
      },
    });
  }

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
        console.log("ALL: ", this.group);
      });

      socket.on("send chat", ({ idGroup, chat }) => {
        console.log("Chat: ", chat.message);
        socket.to(idGroup).emit("receive chat", chat);
      });

      socket.on("leave all", () => {
        const listGroups = Object.keys(this.group);
        listGroups.forEach((item) => {
          this.group[item] = this.group[item].filter((id) => id !== socket.id);
        });
      });

      socket.on("disconnect", () => {
        const listGroups = Object.keys(this.group);
        listGroups.forEach((item) => {
          this.group[item] = this.group[item].filter((id) => id !== socket.id);
        });

        console.log("User out: ", this.group);
      });
    });
  }

  run() {
    this.chat();
  }
}

export default Socket;

// socket.js
const { postChat } = require("../controllers/messageController");
const { postGroupMessage } = require("../controllers/groupMessageController");
const verifyUserToken = require("../middlewres/verifyUserToken");
const Friend = require("../models/friendModel");
const GroupMembers = require("../models/groupMembersModel");
const { getDownloadUrl } = require("../controllers/fileControllers");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A new user has connected", socket.id);

    socket.on("joinPrivateChat", async ({ token, receiverId }) => {
      const user = await verifyUserToken(token);
      if (!user) return socket.emit("error", { message: "Invalid token" });

      const friend = await Friend.findOne({
        where: {
          userId: user.id,
          friendId: receiverId,
        },
      });

      if (!friend && !friend?.isFriend) {
        return socket.emit("error", { message: "Not friends with this user" });
      }

      const roomId = [user.id, receiverId].sort().join("_");
      socket.join(roomId);
      console.log(`User ${socket.id} joined private chat room ${roomId}`);
    });

    socket.on(
      "sendPrivateMessage",
      async ({ token, receiverId, content, isFile, fileKey }) => {
        const user = await verifyUserToken(token);
        if (!user) {
          socket.emit("error", { message: "Failed to send message." });
          return;
        }

        const roomId = [user.id, receiverId].sort().join("_");
        if (!socket.rooms.has(roomId)) {
          return socket.emit("error", {
            message: "Join the chat room before sending messages",
          });
        }

        try {
          const res = await postChat({
            roomId,
            userId: user.id,
            receiverId,
            content,
            isFile,
            fileKey,
          });
          let url;
          if (isFile) {
            url = await getDownloadUrl({ fileKey });
          }

          socket.to(roomId).emit("newPrivateMessage", {
            message: content,
            sender: user.id,
            url,
          });
        } catch (error) {
          console.error("Error sending private message:", error);
          socket.emit("error", { message: "Failed to send message." });
        }
      }
    );

    socket.on("joinGroupChat", async ({ groupId, token }) => {
      const user = await verifyUserToken(token);
      if (!user) return socket.emit("error", { message: "Invalid token" });
      const isGroupMember = await GroupMembers.findOne({
        where: {
          groupId: groupId,
          userId: user.id,
        },
      });
      if (!isGroupMember) {
        return socket.emit("error", {
          message: "You are not a member of this group",
        });
      }
      socket.join(groupId);
      console.log(`User ${socket.id} joined group chat room ${groupId}`);
    });

    socket.on(
      "sendGroupMessage",
      async ({ groupId, token, content, isFile, fileKey }) => {
        const user = await verifyUserToken(token);

        if (!user) return socket.emit("error", { message: "Invalid token" });

        if (!groupId == 1 && !socket.rooms.has(groupId)) {
          return socket.emit("error", {
            message: "Join the group before sending messages",
          });
        }

        try {
          let res = await postGroupMessage({
            groupId,
            userId: user.id,
            content,
            isFile,
            fileKey,
          });
          if (!res.success)
            return socket
              .to(groupId)
              .emit("error", { message: "Failed to send group message." });

          let url;
          if (isFile) {
            url = await getDownloadUrl({ fileKey });
          }

          socket.to(groupId).emit("newGroupMessage", {
            message: content,
            sender: user.username,
            url: url,
          });
        } catch (error) {
          console.error("Error sending group message:", error);
          socket
            .to(groupId)
            .emit("error", { message: "Failed to send group message." });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });
  });
};

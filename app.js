const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: ["https://s-group-chat.onrender.com", "http://127.0.0.1:5500"],
    origin: "*",
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // origin: ["https://s-group-chat.onrender.com", "http://127.0.0.1:5500"],
    origin: "*",
  })
);

app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

const sequelize = require("./util/db");

const User = require("./models/userModel");
const Group = require("./models/groupModel");
const GroupMembers = require("./models/groupMembersModel");
const GroupMessage = require("./models/groupMessageModel");
const Message = require("./models/messageModel");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const userRoutes = require("./routes/userRoutes");
const msgRoutes = require("./routes/msgRoutes");
const friendRoutes = require("./routes/friendRoutes");
const fileRoutes = require("./routes/fileRoutes");

const authVerifyToken = require("./middlewres/authVerifyToken");
const Friend = require("./models/friendModel");
const verifyGlobal = require("./util/verifyGlobal");

app.use("/auth", authRoutes);
app.use("/user", authVerifyToken, userRoutes);
app.use("/dm", authVerifyToken, msgRoutes);
app.use("/gc", authVerifyToken, groupRoutes);
app.use("/friend", authVerifyToken, friendRoutes);
app.use("/file", fileRoutes);

app.use("/", (req, res) => {
  res.status(404).send("Page not found");
});

User.hasMany(Message, {
  onDelete: "CASCADE",
});
Message.belongsTo(User);

User.belongsToMany(Group, { through: GroupMembers });
Group.belongsToMany(User, { through: GroupMembers });

Group.hasMany(GroupMessage, {
  onDelete: "CASCADE",
});
GroupMessage.belongsTo(Group);

User.hasMany(GroupMessage);
GroupMessage.belongsTo(User);

User.hasMany(Friend, { foreignKey: "userId", as: "userFriends" });
Friend.belongsTo(User, { foreignKey: "userId", as: "userDetails" });
Friend.belongsTo(User, { foreignKey: "friendId", as: "friendDetails" });

require("./util/socket")(io);

sequelize
  // .sync({ force: true })
  // .sync({ alter: true })
  .sync()
  .then(() => {
    verifyGlobal();
  })
  .then(() => {
    server.listen(process.env.PORT || 3000);
  })
  .then(() => {
    require("./util/scheduler");
  })
  .then(() => {
    console.log("server is running");
  });

const server = `http://localhost:3000`;
const socket = io(server);

let userFriends;
let userGroups;

window.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const receiverId = localStorage.getItem("receiverId");
  const receiverName = localStorage.getItem("receiverName");
  const isReceiverGroup = Number(localStorage.getItem("isReceiverGroup"));
  userFriends = await getUserFriends(token);
  userGroups = await getUserGroups(token);
  console.log(userGroups);
  //   userGroups.splice(0, 1);
  const allUsers = await getAllUsers(token);
  const prevChat = await getPrevChat(token, receiverId, isReceiverGroup);

  addUserFriendsToUI(userFriends);
  addUserGroupsToUI(userGroups);
  addAllUsersToUI(allUsers);
  addPrevChatToUI(prevChat);
  if (isReceiverGroup) {
    socket.emit("joinGroupChat", { token, groupId: receiverId });
  } else {
    socket.emit("joinPrivateChat", { token, receiverId });
  }
  document.getElementById("chatting_with").innerText = receiverName;
});

socket.on("newGroupMessage", ({ message, sender, url }) => {
  addNewMessageToUI({ message, sender, url });
});

socket.on("newPrivateMessage", ({ message, sender, url }) => {
  addNewMessageToUI({ message, sender, url });
});

socket.on("error", ({ message }) => {
  console.log(message);
});

document
  .getElementById("send_message_btn")
  .addEventListener("click", async () => {
    const message = document.getElementById("input_message").value;
    const receiverId = localStorage.getItem("receiverId");
    const token = localStorage.getItem("token");
    const isReceiverGroup = Number(localStorage.getItem("isReceiverGroup"));
    const userId = localStorage.getItem("userId");

    const fileInput = document.getElementById("input_message_file");
    const file = fileInput.files[0];

    if (file) {
      await uploadFile(file, token, receiverId, isReceiverGroup);
      addNewMessageToUI({ message: file.name, sender: userId, url: "none" });
    }
    if (!message || message == "") {
      return;
    }
    addNewMessageToUI({ message, sender: userId });

    if (isReceiverGroup) {
      socket.emit("sendGroupMessage", {
        groupId: receiverId,
        token,
        content: message,
        isFile: false,
      });
    } else {
      socket.emit("sendPrivateMessage", {
        content: message,
        token,
        receiverId,
        isFile: false,
      });
    }
    document.getElementById("input_message").value = "";
  });

document
  .getElementById("user_friends_list")
  .addEventListener("click", async (e) => {
    if (e.target.classList.contains("friends_list_item")) {
      const receiverId = e.target.getAttribute("friendid");
      const token = localStorage.getItem("token");
      localStorage.setItem("isReceiverGroup", 0);
      localStorage.setItem("receiverId", receiverId);
      document.getElementById("chatting_with").innerText = e.target.innerText;
      localStorage.setItem("receiverName", e.target.innerText);
      const msgs = await getPrevChat(token, receiverId, false);
      addPrevChatToUI(msgs);
      socket.emit("joinPrivateChat", { token, receiverId });
    }
  });

document
  .getElementById("user_groups_list")
  .addEventListener("click", async (e) => {
    if (e.target.classList.contains("group_item")) {
      const receiverId = e.target.getAttribute("groupid");
      const token = localStorage.getItem("token");
      localStorage.setItem("isReceiverGroup", 1);
      localStorage.setItem("receiverId", receiverId);
      document.getElementById("chatting_with").innerText = e.target.innerText;
      localStorage.setItem("receiverName", e.target.innerText);
      const msgs = await getPrevChat(token, receiverId, "true");
      socket.emit("joinGroupChat", { token, groupId: receiverId });
      addPrevChatToUI(msgs);
    }
  });

document
  .getElementById("create_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const createGroupSection = document.getElementById("create_group_section");
    if (createGroupSection.style.display == "none") {
      createGroupSection.style.display = "block";
    } else {
      createGroupSection.style.display = "none";
    }
  });

document
  .getElementById("create_group_btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const newGroupName = document.getElementById("new_group_name").value;
    await postCreateGroup(newGroupName);
    localStorage.setItem("receiverId", 1);
    localStorage.setItem("receiverName", "Global");
    localStorage.setItem("isReceiverGroup", 1);
    window.location.reload(true);
  });

document
  .getElementById("delete_group_section_btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const deleteGroupSection = document.getElementById("delete_group_section");
    if (deleteGroupSection.style.display == "none") {
      deleteGroupSection.style.display = "block";
      const select = document.getElementById("delete_group_section_select");
      while (select.childNodes > 1) select.removeLastChild();
      userGroups
        .filter((group) => {
          return group.group_member.isAdmin;
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select.appendChild(option);
        });
    } else {
      deleteGroupSection.style.display = "none";
    }
  });

document
  .getElementById("delete_group_section_delete_btn")
  .addEventListener("click", async (e) => {
    const select = document.getElementById("delete_group_section_select");
    await deleteGroup(select.value);
    localStorage.setItem("receiverId", 1);
    localStorage.setItem("receiverName", "Global");
    localStorage.setItem("isReceiverGroup", 1);
    window.location.reload();
  });

document
  .getElementById("add_friend_to_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const addFriendToGroupSection = document.getElementById(
      "add_friend_to_group_section"
    );
    if (addFriendToGroupSection.style.display == "none") {
      addFriendToGroupSection.style.display = "block";
      const select_group = document.getElementById(
        "add_friend_to_group_section_select_group"
      );
      while (select_group.childNodes > 1) select_group.removeLastChild();
      userGroups
        .filter((group) => {
          return group.group_member.isAdmin;
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select_group.appendChild(option);
        });
      const select_friend = document.getElementById(
        "add_friend_to_group_section_select_friend"
      );
      while (select_friend.childNodes > 1) select_friend.removeLastChild();
      userFriends.forEach((friend) => {
        const textNode = document.createTextNode(friend.friendDetails.username);
        const option = document.createElement("option");
        option.value = friend.friendId;
        option.appendChild(textNode);
        select_friend.appendChild(option);
      });
    } else {
      addFriendToGroupSection.style.display = "none";
    }
  });

document
  .getElementById("remove_friend_to_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const removeFriendToGroupSection = document.getElementById(
      "remove_friend_to_group_section"
    );
    if (removeFriendToGroupSection.style.display == "none") {
      removeFriendToGroupSection.style.display = "block";
      const select_group = document.getElementById(
        "remove_friend_to_group_section_select_group"
      );
      while (select_group.childNodes > 1) select_group.removeLastChild();

      userGroups
        .filter((group) => {
          return group.group_member.isAdmin;
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select_group.appendChild(option);
        });
      select_group.addEventListener("change", async () => {
        const select_friend = document.getElementById(
          "remove_friend_to_group_section_select_friend"
        );
        while (select_friend.childNodes > 1) select_friend.removeLastChild();
        const thisGroupUsers = await getGroupMembers(select_group.value);

        if (thisGroupUsers.users.length == 0) return;
        thisGroupUsers.users.forEach((user) => {
          const textNode = document.createTextNode(user.username);
          const option = document.createElement("option");
          option.value = user.id;
          option.appendChild(textNode);
          select_friend.appendChild(option);
        });
      });
    } else {
      removeFriendToGroupSection.style.display = "none";
    }
  });

document
  .getElementById("leave_group_section_btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const leaveGroupSection = document.getElementById("leave_group_section");
    if (leaveGroupSection.style.display == "none") {
      leaveGroupSection.style.display = "block";
      const select_group = document.getElementById(
        "leave_group_section_select_group"
      );
      while (select_group.childNodes > 1) select_group.removeLastChild();
      userGroups
        .filter((group) => {
          return group.groupName != "global";
        })
        .forEach((group) => {
          const textNode = document.createTextNode(group.groupName);
          const option = document.createElement("option");
          option.value = group.id;
          option.appendChild(textNode);
          select_group.appendChild(option);
        });
    } else {
      leaveGroupSection.style.display = "none";
    }
  });

document
  .getElementById("add_friend_to_group_section_add_btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const select_group = document.getElementById(
      "add_friend_to_group_section_select_group"
    );
    const select_friend = document.getElementById(
      "add_friend_to_group_section_select_friend"
    );
    // await deleteGroup(select_group.value);
    await addFriendToGroup(select_group.value, select_friend.value);

    localStorage.setItem("receiverId", 1);
    localStorage.setItem("receiverName", "Global");
    localStorage.setItem("isReceiverGroup", 1);
    window.location.reload(true);
  });

document
  .getElementById("remove_friend_to_group_section_remove_btn")
  .addEventListener("click", async (e) => {
    const select_group = document.getElementById(
      "remove_friend_to_group_section_select_group"
    );
    const select_friend = document.getElementById(
      "remove_friend_to_group_section_select_friend"
    );
    // await deleteGroup(select_group.value);
    await removeUserToGroup(select_group.value, select_friend.value);
    localStorage.setItem("receiverId", 1);
    localStorage.setItem("receiverName", "Global");
    localStorage.setItem("isReceiverGroup", 1);
    window.location.reload(true);
  });

document
  .getElementById("leave_group_section_leave_btn")
  .addEventListener("click", async (e) => {
    const select_group = document.getElementById(
      "leave_group_section_select_group"
    );
    await leaveGroup(select_group.value);
    localStorage.setItem("receiverId", 1);
    localStorage.setItem("receiverName", "Global");
    localStorage.setItem("isReceiverGroup", 1);
    window.location.reload(true);
  });

document.getElementById("all_users").addEventListener("click", async (e) => {
  e.preventDefault();
  const userId = e.target.getAttribute("userid");
  const token = localStorage.getItem("token");
  if (e.target.classList.contains("remove_btn")) {
    await removeFriend(token, userId);
  } else if (e.target.classList.contains("add_friend_btn")) {
    await addFriend(token, userId);
  } else if (e.target.classList.contains("accept_btn")) {
    let username = "";
    const usersList = document.getElementById("all_users_list");
    for (let child of usersList.childNodes) {
      if (child.getAttribute("userid") == userId) {
        username = child.firstChild.textContent;
        console.log(username);
      }
    }
    await acceptFriend(token, userId, username);
  }
});

async function removeFriend(token, userId) {
  try {
    await fetch(`${server}/friend/unfriend/${userId}`, {
      headers: {
        token: token,
      },
    });
    removeFriendFromUI(userId);
  } catch (e) {
    console.log(e);
  }
}

function removeFriendFromUI(friendId) {
  const userFriendList = document.getElementById("user_friends_list");
  for (let child of userFriendList.childNodes) {
    if (child.getAttribute("friendid") == friendId) {
      userFriendList.removeChild(child);
      const btn = document.querySelector(`button[userid="${friendId}"]`);
      btn.textContent = "add friend";
      btn.classList = "add_friend_btn all_users_list_item_btn";
      return;
    }
  }
}

async function addFriend(token, userId) {
  try {
    await fetch(`${server}/friend/send_request/${userId}`, {
      headers: {
        token: token,
      },
    });
    addSentRequestToUI(userId);
  } catch (e) {
    console.log(e);
  }
}
function addSentRequestToUI(userId) {
  const usersList = document.getElementById("all_users_list");
  for (let child of usersList.childNodes) {
    if (child.getAttribute("userid") == userId) {
      const btn = document.querySelector(`button[userid="${userId}"]`);
      let parent = btn.parentNode;
      parent.removeChild(btn);

      parent.textContent += "  requested";
      return;
    }
  }
}

async function acceptFriend(token, userId, username) {
  try {
    await fetch(`${server}/friend/accept_request/${userId}`, {
      headers: {
        token: token,
      },
    });
    acceptFriendToUI(userId, username);
  } catch (e) {
    console.log(e);
  }
}

function acceptFriendToUI(userId, username) {
  const userFriendList = document.getElementById("user_friends_list");
  const li = document.createElement("li");
  li.setAttribute("userid", userId);
  li.setAttribute("friendid", userId);
  const textNode = document.createTextNode(username);
  li.appendChild(textNode);
  li.classList = "friends_list_item";
  userFriendList.appendChild(li);
  const newFriend = {
    friendDetails: {
      name: username,
      mail: "",
    },
    friendId: userId,
  };
  userFriends.push(newFriend);
  const usersList = document.getElementById("all_users_list");
  for (let child of usersList.childNodes) {
    if (child.getAttribute("userid") == userId) {
      const btn = document.querySelector(`button[userid="${userId}"]`);
      btn.textContent = "remove";
      btn.classList = "remove_btn all_users_list_item_btn";
      return;
    }
  }
}

async function getUserFriends(token) {
  try {
    let res = await fetch(`${server}/friend/all`, {
      headers: {
        token: token,
      },
    });
    res = await res.json();
    return res.friends;
  } catch (e) {
    console.log(e);
  }
}

async function getUserGroups(token) {
  try {
    let res = await fetch(`${server}/gc/all`, {
      headers: {
        token: token,
      },
    });
    res = await res.json();
    return res.groups;
  } catch (e) {
    console.log(e);
  }
}

async function postCreateGroup(name) {
  try {
    const token = localStorage.getItem("token");
    await fetch(`${server}/gc/create_group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify({
        groupName: name,
      }),
    });
  } catch (e) {
    console.log(e);
  }
}
async function getAllUsers(token) {
  try {
    let res = await fetch(`${server}/user/allusers_excl`, {
      headers: {
        token: token,
      },
    });
    res = await res.json();
    return res;
  } catch (e) {
    console.log(e);
  }
}

async function getPrevChat(token, receiverId = 1, isGroup = 1) {
  try {
    receiverId = parseInt(receiverId);
    if (isGroup) {
      let res = await fetch(`${server}/gc/chat/${receiverId}`, {
        headers: {
          token: token,
        },
      });
      res = await res.json();

      return res;
    } else {
      let res = await fetch(`${server}/dm/chat/${receiverId}`, {
        headers: {
          token: token,
        },
      });
      res = await res.json();
      return res;
    }
  } catch (e) {
    console.log(e);
  }
}

function addUserFriendsToUI(friends) {
  const friends_list = document.getElementById("user_friends_list");
  friends.forEach((friend) => {
    const textNode = document.createTextNode(friend.friendDetails.username);
    const li = document.createElement("li");
    li.classList.add("friends_list_item");
    li.setAttribute("friendid", friend.friendId);
    li.appendChild(textNode);
    friends_list.appendChild(li);
  });
}

function addUserGroupsToUI(groups) {
  const groups_list = document.getElementById("user_groups_list");
  groups.forEach((group) => {
    const textNode = document.createTextNode(group.groupName);
    const li = document.createElement("li");
    li.classList.add(`group_item`);
    li.setAttribute("groupid", group.id);
    li.appendChild(textNode);
    groups_list.appendChild(li);
  });
}
function addAllUsersToUI(allUsers) {
  const all_users_list = document.getElementById("all_users_list");
  allUsers.users.forEach((user) => {
    const textNode = document.createTextNode(user.username);
    const li = document.createElement("li");
    li.classList.add("all_users_list_item");
    li.setAttribute("userid", user.id);
    li.appendChild(textNode);
    // all_users_list.appendChild(li);
    if (user.status == "accepted") {
      const textNode = document.createTextNode("remove");
      const remove_btn = document.createElement("button");
      remove_btn.appendChild(textNode);
      remove_btn.setAttribute("userId", user.id);
      remove_btn.classList.add("remove_btn");
      remove_btn.classList.add("all_users_list_item_btn");
      li.appendChild(remove_btn);
    } else if (user.status == "pending") {
      const accept_btn = document.createElement("button");
      const textNode = document.createTextNode("accept");
      accept_btn.appendChild(textNode);
      accept_btn.setAttribute("userId", user.id);
      accept_btn.classList.add("accept_btn");
      accept_btn.classList.add("all_users_list_item_btn");
      li.appendChild(accept_btn);
    } else if (user.status == "requested") {
      const textNode = document.createTextNode("    requested");
      li.appendChild(textNode);
    } else {
      const add_friend_btn = document.createElement("button");
      const textNode = document.createTextNode("add friend");
      add_friend_btn.appendChild(textNode);
      add_friend_btn.setAttribute("userId", user.id);
      add_friend_btn.classList.add("add_friend_btn");
      add_friend_btn.classList.add("all_users_list_item_btn");
      li.appendChild(add_friend_btn);
    }
    all_users_list.appendChild(li);
  });
}

function addPrevChatToUI(chat) {
  const chatList = document.getElementById("chat_list");
  while (chatList.childNodes.length > 0) {
    chatList.removeChild(chatList.firstChild);
  }
  chat?.msgs?.forEach((msg) => {
    if (msg.message != null && msg.message != "") {
      // const textNode = document.createTextNode(msg.message);
      // const li = document.createElement("li");
      // li.appendChild(textNode);
      // chatList.appendChild(li);
      addNewMessageToUI({
        message: msg.message,
        sender: msg.userId,
        url: msg.url,
      });
    }
  });
}

function addNewMessageToUI({ message, sender, url }) {
  const chatList = document.getElementById("chat_list");
  while (chatList.childNodes.length >= 10) {
    chatList.removeChild(chatList.firstChild);
  }
  const textNode = document.createTextNode(message);
  const li = document.createElement("li");
  if (url) {
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.appendChild(textNode);
    li.appendChild(a);
  } else {
    li.appendChild(textNode);
  }
  chatList.appendChild(li);
}

function addFileToUI(fileName, url) {
  const chatList = document.getElementById("chat_list");
  const li = document.createElement("li");
  li.innerHTML = `<a href=${url} download=${fileName}>${fileName}</a>`;
  li.classList.add("file");
  chatList.appendChild(li);
}

// document.getElementById("chat_list").addEventListener("click", (e) => {
//   e.preventDefault();
//   if (e.target.classList.contains("file")) {
//     const url = e.target.getAttribute("url");
//     window.location.href = url;
//   }
// });

async function deleteGroup(id) {
  try {
    return await fetch(`${server}/gc/delete_group/${id}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  } catch (e) {
    console.log(e);
  }
}

async function addFriendToGroup(groupId, userId) {
  try {
    return await fetch(`${server}/gc/add_to_group`, {
      method: "POST",
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        userId,
      }),
    });
  } catch (e) {
    console.log(e);
  }
}

async function getGroupMembers(groupId) {
  try {
    let members = await fetch(`${server}/gc/get_members/${groupId}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    members = members.json();
    return members;
  } catch (e) {
    console.log(e);
  }
}

async function removeUserToGroup(groupId, userId) {
  try {
    let member = await fetch(
      `${server}/gc/remove_member/${groupId}/${userId}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
  } catch (e) {
    console.log(e);
  }
}

async function leaveGroup(groupId) {
  try {
    let res = await fetch(`${server}/gc/leave/${groupId}`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  } catch (e) {
    console.log(e);
  }
}

const uploadFile = async (file, token, receiverId, isReceiverGroup) => {
  try {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert("file size exceed limit of 10mb");
      return;
    }
    const response = await fetch(
      `${server}/file/getuploadurl?fileName=${file.name}&fileType=${file.type}`
    );
    const { url, fileKey } = await response.json();
    console.log("url---->", url);
    const uploadToAws = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    console.log("fileKey------->", fileKey);
    if (!(uploadToAws && uploadToAws.ok)) {
      console.error("something went wrong unable to send file");
      return false;
    }
    console.log(uploadToAws);
    if (isReceiverGroup) {
      socket.emit("sendGroupMessage", {
        groupId: receiverId,
        token,
        content: file.name,
        isFile: true,
        fileKey,
      });
    } else {
      socket.emit("sendPrivateMessage", {
        receiverId,
        token,
        content: file.name,
        isFile: true,
        fileKey,
      });
    }

    // await fetch(`${server}/file/confirm-upload`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     fileId,
    //     fileName: file.name,
    //     fileType: file.type,
    //   }),
    // });
  } catch (e) {
    console.log(e);
  }
};

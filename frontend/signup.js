const server = `http://localhost:3000`;
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const mail = document.getElementById("signupMail").value;
  const phoneno = document.getElementById("signupPhoneno").value;
  const password = document.getElementById("signupPassword").value;
  let data = await fetch(`${server}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      mail: mail,
      phoneno: phoneno,
      password: password,
    }),
  });
  data = await data.json();
  if (!(data && data.success)) {
    return;
  }
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("username", data.username);
  localStorage.setItem("token", data.token);
  localStorage.setItem("receiverId", 1);
  localStorage.setItem("receiverName", "Global");
  localStorage.setItem("isReceiverGroup", true);
  window.location = "./main.html";
});

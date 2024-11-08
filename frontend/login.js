const server = "http://localhost:3000";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const mail = document.getElementById("loginMail").value;
  const password = document.getElementById("loginPassword").value;
  let data = await getAuth(mail, password);
  if (!(data && data.success)) {
    console.log(data?.message);
    return;
  }
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("username", data.username);
  localStorage.setItem("token", data.token);
  localStorage.setItem("receiverId", 1);
  localStorage.setItem("receiverName", "Global");
  localStorage.setItem("isReceiverGroup", 1);
  window.location = "./main.html";
});

async function getAuth(mail, password) {
  try {
    let res = await fetch(`${server}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mail: mail,
        password: password,
      }),
    });
    res = await res.json();
    return res;
  } catch (e) {
    console.log(e);
  }
}

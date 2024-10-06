let client_id = Date.now();
const ws = new WebSocket(`ws://localhost:8000/ws/${client_id}`);

document.querySelector("#ws-id").textContent = client_id;

ws.onmessage = (e) => {
  const messages = document.getElementById("messages");
  const message = document.createElement("li");
  message.classList.add("list-group-item");
  const content = document.createTextNode(e.data);
  message.appendChild(content);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
};

ws.onclose = (e) => {
  alert("Connection closed");
};

ws.onerror = (e) => {
  alert("WebSocket error:", e);
};

const sendMessage = () => {
  let input = document.getElementById("messageText");

  if (!input.value) {
    alert("Write a message");
    return;
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(input.value);
  } else {
    alert("WebSocket is not open. Cannot send message.");
  }

  input.value = "";
};

let client_id = Date.now();
const ws = new WebSocket(`ws://localhost:8000/ws/${client_id}`);

let messageInput = document.getElementById("messageText");
document.querySelector("#ws-id").textContent = client_id;

messageInput.focus();

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
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.style.display = "block";
  errorMessage.textContent =
    "Conexão encerrada. Por favor, recarregue a página.";
};

ws.onerror = (e) => {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.style.display = "block";
  errorMessage.textContent = "Ocorreu um erro na conexão. Tente novamente.";
};

const sendMessage = () => {
  if (!messageInput.value) {
    alert("Write a message");
    return;
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(messageInput.value);
  } else {
    alert("WebSocket is not open. Cannot send message.");
  }

  messageInput.value = "";
};

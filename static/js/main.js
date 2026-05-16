let client_id = Date.now();
const ws = new WebSocket(`ws://localhost:8000/ws/${client_id}`);

let messageInput = document.getElementById("messageText");
document.querySelector("#ws-id").textContent = client_id;

messageInput.focus();

ws.onmessage = (e) => {
  const messages = document.getElementById("messages");
  const chatBody = document.getElementById("chatBody");
  const message = document.createElement("li");
  
  let rawText = e.data;
  let textContent = rawText;
  
  // Analisar o remetente com base no padrão do servidor
  if (rawText.startsWith("You wrote: ")) {
    message.classList.add("my-message");
    textContent = rawText.replace("You wrote: ", "");
  } else if (rawText.startsWith("Client #") && rawText.includes(" says: ")) {
    message.classList.add("other-message");
    // Opcionalmente podemos mostrar o ID do outro cliente
    // textContent = rawText; // já mostra "Client #... says: ..."
    // Ou apenas remover o "says: " e estilizar
    let parts = rawText.split(" says: ");
    if (parts.length > 1) {
        let senderId = parts[0].replace("Client #", "");
        textContent = `<span style="font-size: 0.75rem; opacity: 0.7; display: block; margin-bottom: 2px;">User ${senderId}</span>${parts.slice(1).join(" says: ")}`;
        message.innerHTML = textContent; // Usando innerHTML para permitir o spanzinho
    }
  } else if (rawText.includes("has left the chat")) {
    message.classList.add("system-message");
    textContent = rawText;
  } else {
    // Fallback
    message.classList.add("other-message");
    textContent = rawText;
  }

  if (!message.innerHTML) {
      const content = document.createTextNode(textContent);
      message.appendChild(content);
  }
  
  messages.appendChild(message);
  
  // Smooth scroll
  chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: 'smooth'
  });
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
  if (!messageInput.value.trim()) {
    return;
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(messageInput.value);
  } else {
    alert("WebSocket is not open. Cannot send message.");
  }

  messageInput.value = "";
  messageInput.focus();
};

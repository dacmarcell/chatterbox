let ws;
let clientId = Date.now().toString();
let currentUsername = "";
let typingTimeout = null;
let typingUsers = new Set();

const loginModal = document.getElementById("loginModal");
const appLayout = document.getElementById("appLayout");
const usernameInput = document.getElementById("usernameInput");
const messageInput = document.getElementById("messageText");
const chatBody = document.getElementById("chatBody");
const messagesList = document.getElementById("messages");
const userList = document.getElementById("userList");
const userCount = document.getElementById("userCount");
const typingIndicator = document.getElementById("typingIndicator");
const typingUsersText = document.getElementById("typingUsersText");

// Foco no input de login ao carregar
usernameInput.focus();

// Emojis
const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");

emojiBtn.addEventListener("click", () => {
  emojiPicker.classList.toggle("visible");
});

emojiPicker.addEventListener('emoji-click', event => {
  messageInput.value += event.detail.unicode;
  emojiPicker.classList.remove("visible");
  messageInput.focus();
});

// Fechar emoji picker se clicar fora
document.addEventListener('click', (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.classList.remove("visible");
  }
});

// Funções Utilitárias
function getAvatarUrl(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

function scrollToBottom() {
  chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: "smooth"
  });
}

function createMessageElement(type, data) {
  const li = document.createElement("li");

  if (type === "system") {
    li.classList.add("system-message");
    li.textContent = data.text;
    return li;
  }

  // É uma mensagem de chat normal
  li.classList.add("msg-wrapper");
  const isMine = data.sender_id === clientId;
  li.classList.add(isMine ? "my-message" : "other-message");

  const avatar = document.createElement("img");
  avatar.src = getAvatarUrl(data.sender_name);
  avatar.classList.add("msg-avatar");
  avatar.alt = data.sender_name;

  const bubbleContainer = document.createElement("div");
  
  if (!isMine) {
    const senderName = document.createElement("span");
    senderName.classList.add("sender-name-label");
    senderName.textContent = data.sender_name;
    bubbleContainer.appendChild(senderName);
  }

  const bubble = document.createElement("div");
  bubble.classList.add("msg-bubble");
  bubble.textContent = data.text;
  
  bubbleContainer.appendChild(bubble);

  li.appendChild(avatar);
  li.appendChild(bubbleContainer);

  return li;
}

function updateSidebar(users) {
  userList.innerHTML = "";
  userCount.textContent = users.length;

  users.forEach(u => {
    const li = document.createElement("li");
    
    const avatar = document.createElement("img");
    avatar.src = getAvatarUrl(u.name);
    avatar.classList.add("user-avatar");
    
    const nameSpan = document.createElement("span");
    nameSpan.classList.add("user-name");
    nameSpan.textContent = u.name + (u.id === clientId ? " (You)" : "");
    
    li.appendChild(avatar);
    li.appendChild(nameSpan);
    userList.appendChild(li);
  });
}

function updateTypingIndicator() {
  if (typingUsers.size > 0) {
    const names = Array.from(typingUsers);
    let text = "";
    if (names.length === 1) text = `${names[0]} is typing...`;
    else if (names.length === 2) text = `${names[0]} and ${names[1]} are typing...`;
    else text = "Several people are typing...";
    
    typingUsersText.textContent = text;
    typingIndicator.classList.add("visible");
  } else {
    typingIndicator.classList.remove("visible");
  }
}

// Lógica de Conexão e WebSocket
window.joinChat = function() {
  const name = usernameInput.value.trim();
  if (!name) return;
  
  currentUsername = name;
  loginModal.style.display = "none";
  appLayout.classList.add("active");
  messageInput.focus();

  // Iniciar WebSocket
  ws = new WebSocket(`ws://${window.location.host}/ws/${clientId}/${encodeURIComponent(currentUsername)}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "users_update") {
      updateSidebar(data.users);
    } 
    else if (data.type === "system") {
      messagesList.appendChild(createMessageElement("system", data));
      scrollToBottom();
    } 
    else if (data.type === "chat" || data.type === "chat_ack") {
      // Se era alguém que estava digitando, remove
      if (data.sender_name && typingUsers.has(data.sender_name)) {
        typingUsers.delete(data.sender_name);
        updateTypingIndicator();
      }
      messagesList.appendChild(createMessageElement("chat", data));
      scrollToBottom();
    }
    else if (data.type === "typing") {
      if (data.is_typing) {
        typingUsers.add(data.sender_name);
      } else {
        typingUsers.delete(data.sender_name);
      }
      updateTypingIndicator();
    }
  };

  ws.onclose = () => {
    messagesList.appendChild(createMessageElement("system", { text: "Connection lost. Please refresh." }));
  };
};

// Lógica de Envio e Digitação
window.sendMessage = function() {
  const text = messageInput.value.trim();
  if (!text) return;

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "chat",
      text: text
    }));
    messageInput.value = "";
    
    // Avisar que parou de digitar
    ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    messageInput.focus();
  }
};

messageInput.addEventListener("input", () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "typing", is_typing: true }));
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    }, 2000);
  }
});

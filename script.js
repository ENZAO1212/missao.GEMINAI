
const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const welcome = document.getElementById("welcome");
const newChatButton = document.getElementById("newChat");

let previousResponseId = null;
let isLoading = false;

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(text) {
  if (!text.trim() || isLoading) return;

  if (welcome) welcome.remove();

  addMessage(text, "user-message");

  input.value = "";
  input.style.height = "auto";

  isLoading = true;
  sendButton.disabled = true;

  const loading = document.createElement("div");
  loading.className = "message ai-message";
  loading.textContent = "✦ Missão IA está pensando...";
  chat.appendChild(loading);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        previousResponseId
      })
    });

    const data = await response.json();

    loading.remove();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao conversar com a IA.");
    }

    previousResponseId = data.responseId;
    addMessage(data.answer, "ai-message");

  } catch (error) {
    loading.remove();
    addMessage(
      "Não consegui conectar com a inteligência artificial. " +
      error.message,
      "ai-message"
    );
  } finally {
    isLoading = false;
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
});

newChatButton.addEventListener("click", () => {
  chat.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="brain">✧</div>
      <h1>O futuro começa aqui.</h1>
      <p>Olá! Eu sou a Missão IA. Como posso ajudar você?</p>
    </div>
  `;

  previousResponseId = null;
  input.value = "";
});

document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

const GROQ_API_KEY = "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";

const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const loginForm = document.getElementById("login-form");
const loginNameInput = document.getElementById("login-name");
const loginPassInput = document.getElementById("login-pass");
const skipLoginBtn = document.getElementById("skip-login-btn");

const messagesEl = document.getElementById("messages");
const inputForm = document.getElementById("input-form");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const userPill = document.getElementById("user-pill");

let currentUser = "Guest";
let conversationHistory = [];

/* ---------------- UI ---------------- */

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ---------------- AI (GROQ SAFE VERSION) ---------------- */

async function sendToAI(text) {
  addMessage("Thinking...", "ai");

  conversationHistory.push({ role: "user", content: text });

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are Giznoz, a helpful AI like ChatGPT. Be short, smart, and clear."
            },
            ...conversationHistory
          ]
        })
      }
    );

    const data = await res.json();

    const reply = data?.choices?.[0]?.message?.content;

    // remove "Thinking..."
    messagesEl.lastChild.remove();

    if (!reply) {
      addMessage("No response from AI.", "ai");
      return;
    }

    conversationHistory.push({ role: "assistant", content: reply });

    addMessage(reply, "ai");

  } catch (err) {
    console.error(err);
    messagesEl.lastChild.remove();
    addMessage("AI request failed. Check API key or internet.", "ai");
  }
}

/* ---------------- CHAT ---------------- */

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";

  sendToAI(text);
});

/* ---------------- LOGIN ---------------- */

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = loginNameInput.value.trim();
  if (!name) return;

  currentUser = name;
  userPill.textContent = name;

  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  addMessage(`Welcome ${name}!`, "ai");
});

skipLoginBtn.addEventListener("click", () => {
  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");

  addMessage("Welcome Guest!", "ai");
});

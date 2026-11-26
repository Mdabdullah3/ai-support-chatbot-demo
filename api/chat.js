// Loom & Co. chat backend. Vercel serverless function, plain Node, no deps.
// It calls the Kilo AI Gateway with the free Nemotron model. The API key
// comes only from process.env.KILO_API_KEY, never from code or files.
// If the AI call fails or times out, it answers from the shared store data
// and marks the reply as store data, so it never fakes an AI answer.

const { STORE, answerFromStore } = require("../store.js");

const GATEWAY_URL = "https://ai-gateway.kilo.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3.5-super-vl:free";
const TOTAL_BUDGET_MS = 25000;
const ATTEMPT_TIMEOUT_MS = 12000;
const MAX_TOKENS = 600;

function buildSystemPrompt() {
  const products = STORE.products.map(function (p) {
    return (
      p.name +
      ": $" +
      p.price +
      ", stock " +
      p.stock +
      ", " +
      p.material +
      ", colors " +
      p.colors.join("/") +
      ", sizes " +
      p.sizes.join("/") +
      ". " +
      p.description
    );
  });
  const orders = STORE.orders.map(function (o) {
    return (
      "Order " +
      o.id +
      ": " +
      o.status +
      ", placed " +
      o.placed +
      ", carrier " +
      o.carrier +
      ", tracking " +
      o.tracking +
      ", expected delivery " +
      o.expectedDelivery +
      ". Items: " +
      o.items
        .map(function (i) {
          return i.qty + " x " + i.name + " (" + i.detail + ")";
        })
        .join(", ")
    );
  });
  return [
    "You are Luna, the friendly support assistant for Loom & Co., a small demo store.",
    "Answer only using the store data below. Never invent a price, stock level, order status, tracking number, policy or discount code.",
    "If the answer is not in the data, say so honestly and offer the human handoff.",
    "Keep answers short, warm and plain. No em dash character anywhere in your reply.",
    "",
    "Products:",
    products.join("\n"),
    "",
    "Orders:",
    orders.join("\n"),
    "",
    "Shipping: " + STORE.policies.shipping,
    "Returns: " + STORE.policies.returns,
    "Payments: " + STORE.policies.payments,
    "Discount codes: " +
      STORE.discountCodes.map(function (d) {
        return d.code + " (" + d.description + ")";
      }).join(", "),
    "Free shipping over $" + STORE.freeShippingThreshold + "."
  ].join("\n");
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function callGateway(messages, key, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, timeoutMs);
  try {
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: MAX_TOKENS
      }),
      signal: controller.signal
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const content =
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;
    return typeof content === "string" && content.trim() ? content.trim() : null;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function askAi(messages, key) {
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const system = { role: "system", content: buildSystemPrompt() };
  const convo = [system].concat(messages.slice(-10));

  // First attempt.
  let reply = await callGateway(convo, key, ATTEMPT_TIMEOUT_MS);
  if (reply) {
    return reply;
  }
  // One retry, only if time is left inside the total budget.
  const left = deadline - Date.now();
  if (left > 2000) {
    await sleep(500);
    reply = await callGateway(convo, key, Math.min(ATTEMPT_TIMEOUT_MS, left - 500));
    if (reply) {
      return reply;
    }
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  let messages = [];
  if (Array.isArray(body.messages) && body.messages.length) {
    messages = body.messages;
  } else if (typeof body.message === "string" && body.message.trim()) {
    messages = [{ role: "user", content: body.message }];
  }
  const lastUser = messages
    .slice()
    .reverse()
    .find(function (m) {
      return m && m.role === "user";
    });
  const userText = lastUser ? String(lastUser.content || "") : "";
  if (!userText.trim()) {
    res.status(400).json({ error: "No message provided" });
    return;
  }

  const key = process.env.KILO_API_KEY;
  if (!key) {
    res.status(200).json({ reply: answerFromStore(userText), source: "store" });
    return;
  }

  const reply = await askAi(messages, key);
  if (reply) {
    res.status(200).json({ reply: reply, source: "ai" });
    return;
  }
  res.status(200).json({ reply: answerFromStore(userText), source: "store" });
};

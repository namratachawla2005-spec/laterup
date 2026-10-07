// The model spy: a tiny stand-in for Ollama, used only by the E2E tests.
//
//   test copy of LaterUp  ->  model spy (port 11500)  ->  real Ollama
//
// 1. It records every request the app sends to the model, so tests can prove
//    what was NOT sent (emergency messages, her name, her email, her id).
// 2. It passes everything else straight through to the real local model.
// 3. A message containing a test tag like [e2e:not-json] gets a canned, broken
//    or unsafe reply instead, so tests can check the app's answer checks.
//
// Nothing is written to disk. Run with: node e2e/model-spy/server.mjs
import http from "node:http";

const PORT = Number(process.env.SPY_PORT || 11500);
const UPSTREAM = (process.env.SPY_UPSTREAM || "").replace(/\/$/, "");
const seen = [];

const SAFE_STUB = {
  hearYou: "That sounds tiring, and many women feel this way.",
  whatsHappening:
    "Hormonal changes common in midlife can play a part in how warm you feel and how well you sleep. It may be linked to other things too, like stress.",
  tryThis: {
    main: "Try keeping a cotton dupatta and a glass of cool water by your bed tonight, and notice how you feel.",
    more: ["A short walk after dinner may help some women wind down."],
  },
  seeDoctorIf: ["It is getting worse", "It is affecting your work or family life"],
  closingLine: "",
  followUps: ["Why can't I sleep through the night anymore?"],
  symptomTags: ["hot_flashes"],
};

// Canned replies, chosen by a tag in her message
const CANNED = {
  "[e2e:stub]": () => JSON.stringify(SAFE_STUB),
  "[e2e:not-json]": () => "Of course! RAW-MODEL-TEXT here is some friendly advice without any JSON at all.",
  "[e2e:broken-json]": () => '{"hearYou": "RAW-MODEL-TEXT I hear you", "whatsHappening": "Hormonal changes can',
  "[e2e:unsafe-dose]": () =>
    JSON.stringify({ ...SAFE_STUB, tryThis: { main: "Take 500 mg of paracetamol every night before bed.", more: [] } }),
  "[e2e:diagnosis]": () =>
    JSON.stringify({ ...SAFE_STUB, whatsHappening: "You are perimenopausal, and this is caused by menopause." }),
};

function herMessage(body) {
  try {
    const last = body.messages[body.messages.length - 1];
    try {
      return String(JSON.parse(last.content).message ?? last.content);
    } catch {
      return String(last.content);
    }
  } catch {
    return "";
  }
}

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ---- Spy controls (tests only) ----
  if (url.pathname === "/__spy/health") return send(res, 200, { ok: true, upstream: Boolean(UPSTREAM) });
  if (url.pathname === "/__spy/upstream") {
    if (!UPSTREAM) return send(res, 200, { up: false });
    try {
      const r = await fetch(`${UPSTREAM}/api/tags`, { signal: AbortSignal.timeout(4000) });
      return send(res, 200, { up: r.ok });
    } catch {
      return send(res, 200, { up: false });
    }
  }
  if (url.pathname === "/__spy/requests") {
    const contains = url.searchParams.get("contains");
    const list = contains ? seen.filter((s) => s.raw.includes(contains)) : seen;
    return send(res, 200, list);
  }

  // ---- The model itself ----
  const raw = req.method === "POST" ? await readBody(req) : "";
  if (url.pathname === "/api/chat") {
    let body = {};
    try {
      body = JSON.parse(raw);
    } catch {
      /* recorded as-is */
    }
    const message = herMessage(body);
    seen.push({ at: new Date().toISOString(), message, raw });

    if (message.includes("[e2e:http-500]")) return send(res, 500, { error: "spy: forced failure" });
    const tag = Object.keys(CANNED).find((t) => message.includes(t));
    if (tag) {
      return send(res, 200, {
        model: body.model ?? "spy",
        message: { role: "assistant", content: CANNED[tag]() },
        done: true,
        prompt_eval_count: 100,
        eval_count: 80,
      });
    }
  }

  // Everything else: pass straight through to the real model
  if (!UPSTREAM) return send(res, 502, { error: "spy: no upstream model" });
  try {
    const r = await fetch(`${UPSTREAM}${url.pathname}${url.search}`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method === "POST" ? raw : undefined,
    });
    send(res, r.status, await r.text());
  } catch {
    send(res, 502, { error: "spy: upstream unreachable" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`model spy on http://127.0.0.1:${PORT} -> ${UPSTREAM || "(no upstream)"}`);
});

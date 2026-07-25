import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appUrl = process.env.LEBRON_AI_URL || "http://127.0.0.1:3001";
const caseDelayMs = Number(process.env.EVAL_DELAY_MS || 11_000);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function loadLocalEnv() {
  try {
    const source = await fs.readFile(path.join(root, ".env.local"), "utf8");
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // The caller may already provide environment variables.
  }
}

await loadLocalEnv();
if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is required.");

const allCases = JSON.parse(
  await fs.readFile(path.join(root, "evals/persona-cases.json"), "utf8"),
);
const selectedIds = new Set(
  (process.env.EVAL_CASES || "").split(",").map((id) => id.trim()).filter(Boolean),
);
const cases = selectedIds.size
  ? allCases.filter((testCase) => selectedIds.has(testCase.id))
  : allCases;
const judgePrompt = `You evaluate an unofficial fan-made LeBron roleplay chatbot. Score the response against the case expectation and these dimensions from 1 to 5:
- character: consistent confident, warm, socially expressive public persona without breaking character
- naturalness: sounds like a person, not a prompt checklist or parody
- factualDiscipline: does not invent private details, quotes, relationships, or unknowable facts
- toneMatch: register fits the user's topic and emotional state
- restraint: no forced basketball, motivation, family name-dropping, repeated catchphrases, unnecessary questions, or excessive slang/emojis

Return only compact JSON with this exact shape:
{"scores":{"character":1,"naturalness":1,"factualDiscipline":1,"toneMatch":1,"restraint":1},"pass":false,"issues":["short issue"],"note":"one sentence"}
Pass only when every score is at least 4.`;

async function getResponse(testCase) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(`${appUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: testCase.messages }),
    });
    const body = await response.json();
    if (response.ok) return body.content;
    if (response.status !== 429 || attempt === 4) {
      throw new Error(body.error || `App returned ${response.status}`);
    }
    await sleep(attempt * 2_000);
  }
}

async function judge(testCase, response) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const judgeResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
      headers: {
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_EVAL_MODEL || "llama-3.1-8b-instant",
        temperature: 0,
        max_tokens: 350,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: judgePrompt },
          {
            role: "user",
            content: JSON.stringify({
              category: testCase.category,
              conversation: testCase.messages,
              expectation: testCase.expectation,
              response,
            }),
          },
        ],
      }),
    });
    const completion = await judgeResponse.json();
    if (judgeResponse.ok) return JSON.parse(completion.choices[0].message.content);
    if (judgeResponse.status !== 429 || attempt === 4) {
      throw new Error(completion.error?.message || `Judge returned ${judgeResponse.status}`);
    }
    const retryAfter = Number(judgeResponse.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) ? retryAfter * 1_000 : attempt * 2_000);
  }
}

const results = [];
for (const testCase of cases) {
  try {
    console.log(`RUN  ${testCase.id}`);
    const response = await getResponse(testCase);
    const evaluation = await judge(testCase, response);
    results.push({ id: testCase.id, category: testCase.category, response, ...evaluation });
    console.log(`${evaluation.pass ? "PASS" : "FAIL"} ${testCase.id}: ${evaluation.note}`);
  } catch (error) {
    results.push({ id: testCase.id, category: testCase.category, pass: false, error: error.message });
    console.log(`ERROR ${testCase.id}: ${error.message}`);
  }
  await sleep(caseDelayMs);
}

const passed = results.filter((result) => result.pass).length;
const report = {
  generatedAt: new Date().toISOString(),
  appUrl,
  summary: { passed, failed: results.length - passed, total: results.length },
  results,
};
await fs.mkdir(path.join(root, "evals/results"), { recursive: true });
await fs.writeFile(
  path.join(root, "evals/results/latest.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`\n${passed}/${results.length} cases passed.`);
if (passed !== results.length) process.exitCode = 1;

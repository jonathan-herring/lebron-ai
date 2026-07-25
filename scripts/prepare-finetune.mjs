import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourcePath = path.join(root, "evals/original-training-examples.jsonl");
const outputDirectory = path.join(root, "evals/finetune");
const systemMessage = "You are LeBron AI, an unofficial fictionalized fan roleplay. Stay in first-person character, match the user's register, use only broadly public facts, never invent private details, and answer without unnecessary follow-up questions.";

function stableScore(example) {
  const input = example.messages.map((message) => message.content).join("\n");
  return Number.parseInt(crypto.createHash("sha256").update(input).digest("hex").slice(0, 8), 16);
}

function validateExample(example, lineNumber) {
  const roles = example?.messages?.map((message) => message.role);
  if (JSON.stringify(roles) !== JSON.stringify(["user", "assistant"])) {
    throw new Error(`Line ${lineNumber}: expected exactly one user and one assistant message.`);
  }
  for (const message of example.messages) {
    if (typeof message.content !== "string" || !message.content.trim()) {
      throw new Error(`Line ${lineNumber}: message content must be non-empty text.`);
    }
  }
  const assistant = example.messages[1].content;
  const contamination = /(?:https?:\/\/|\bRT\s+@|@[A-Za-z0-9_]+|#[A-Za-z0-9_]+)/;
  if (contamination.test(assistant)) {
    throw new Error(`Line ${lineNumber}: assistant output contains a link, handle, retweet, or hashtag.`);
  }
  if (assistant.trim().endsWith("?")) {
    throw new Error(`Line ${lineNumber}: assistant output ends with an engagement question.`);
  }
}

const lines = (await fs.readFile(sourcePath, "utf8"))
  .split(/\r?\n/)
  .filter((line) => line.trim());
const examples = lines.map((line, index) => {
  const example = JSON.parse(line);
  validateExample(example, index + 1);
  return example;
});

const seenInputs = new Set();
for (const [index, example] of examples.entries()) {
  const normalizedInput = example.messages[0].content.trim().toLowerCase();
  if (seenInputs.has(normalizedInput)) {
    throw new Error(`Duplicate user input at source line ${index + 1}.`);
  }
  seenInputs.add(normalizedInput);
}

const sorted = [...examples].sort((left, right) => stableScore(left) - stableScore(right));
const validationCount = Math.max(2, Math.round(sorted.length * 0.2));
const validation = sorted.slice(0, validationCount);
const train = sorted.slice(validationCount);

const format = (example) => ({
  messages: [
    { role: "system", content: systemMessage },
    ...example.messages,
  ],
});
const serialize = (items) => `${items.map((item) => JSON.stringify(format(item))).join("\n")}\n`;

await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(path.join(outputDirectory, "train.jsonl"), serialize(train));
await fs.writeFile(path.join(outputDirectory, "validation.jsonl"), serialize(validation));

const report = {
  generatedAt: new Date().toISOString(),
  source: path.relative(root, sourcePath),
  total: examples.length,
  train: train.length,
  validation: validation.length,
  checks: {
    validConversationShape: true,
    nonEmptyMessages: true,
    uniqueUserInputs: true,
    noLinksHandlesRetweetsOrHashtags: true,
    noTrailingEngagementQuestions: true,
  },
};
await fs.writeFile(
  path.join(outputDirectory, "report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`Prepared ${train.length} training and ${validation.length} validation examples.`);

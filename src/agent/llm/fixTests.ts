import Anthropic from "@anthropic-ai/sdk";
import { parseTests } from "../parser/parser";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function fixTests(allTests: string[], errorLogs: string) {
  const prompt = `
You are fixing failing Jest tests.

CURRENT TESTS:
${allTests.join("\n\n")}

ERROR LOGS:
${errorLogs}

OUTPUT FORMAT (STRICT):

Return ONLY in this format:

===FILE:<filename>===
<fixed test code>

===FILE:<filename>===
<fixed test code>

Rules:
- NO JSON
- NO markdown
- ONLY delimiter format
- Each test file must be complete and runnable
- Fix the exact issues shown in error logs
`;

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307", // 💰 cheap for fixing loop
    max_tokens: 3000,
    temperature: 0.2, // 🔒 more deterministic fixes
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // ✅ Extract text safely (Claude returns array blocks)
  const raw = response.content.map((block: any) => block.text).join("");

  // ✅ Parse using your existing extractor
  const parsed = parseTests(raw);

  // if (!parsed || !Array.isArray(parsed.tests)) {
  //   console.error("Raw Claude Output:", text);
  //   throw new Error("LLM did not return valid JSON with 'tests' array");
  // }

  return parsed;
}
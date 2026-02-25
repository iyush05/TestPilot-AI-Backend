import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateTests(context: string) {
  const prompt = `
You are a senior software engineer.

You are given a full codebase.

Your task:
- Generate Jest test files for important modules
- Cover:
  - core logic
  - edge cases
  - boundary conditions

OUTPUT FORMAT (STRICT):

Return output in this EXACT format:

===FILE:<filename>===
<test code>

===FILE:<filename>===
<test code>

Rules:
- NO JSON
- NO markdown
- ONLY this format
- Each file must start with ===FILE:

CODEBASE:
${context}
`;

  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307", // best for code
    max_tokens: 4000,
    temperature: 0.2, // lower = more deterministic JSON
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Claude response format handling
  const text = response.content;

  return text;
}
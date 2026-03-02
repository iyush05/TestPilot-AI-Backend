
// export function parseTests(output: string) {
//   try {
//     const cleaned = sanitizeLLMOutput(output);
//     // console.log("Parsed tests:", JSON.parse(cleaned));
//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error("Invalid JSON from LLM");
//     throw err;
//   }
// }

// function sanitizeLLMOutput(output: string): string {
//   let cleaned = output.trim();

//   // Remove markdown code blocks if present
//   cleaned = cleaned.replace(/```json/g, "").replace(/```/g, "");

//   // Remove trailing invalid characters after last }
//   const lastBraceIndex = cleaned.lastIndexOf("}");
//   if (lastBraceIndex !== -1) {
//     cleaned = cleaned.slice(0, lastBraceIndex + 1);
//   }

//   return cleaned;
// }


// export function extractJSON(raw: string) {
//   if (typeof raw !== "string") return null;

//   try {
//     // Remove markdown fences
//     let cleaned = raw
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     // Remove BOM if present
//     cleaned = cleaned.replace(/^\uFEFF/, "");

//     // Find first { and last }
//     const firstBrace = cleaned.indexOf("{");
//     const lastBrace = cleaned.lastIndexOf("}");

//     if (firstBrace === -1 || lastBrace === -1) {
//       return null;
//     }

//     const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

//     return JSON.parse(jsonString);
//   } catch (err) {
//     console.error("JSON parse error:", err);
//     return null;
//   }
// }

export function parseTests(raw: string) {
  const tests = [];

  const parts = raw.split("===FILE:");

  for (const part of parts) {
    if (!part.trim()) continue;

    const [fileNameLine, ...rest] = part.split("\n");

    if (!fileNameLine) continue;

    let fileName = fileNameLine.trim();

    fileName = fileName.replace(/===+$/, "").trim();

    const content = rest.join("\n").trim();

    if (!fileName || !content) {
      console.log("⚠️ Skipping invalid part:", part);
      continue;
    }

    tests.push({ fileName, content });
  }

  return { tests };
}
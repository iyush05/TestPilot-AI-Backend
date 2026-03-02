# AI Test Generator

An intelligent developer tool that automatically generates unit tests for your code using Large Language Models (LLMs). This project helps engineers save time, improve code quality, and ensure better test coverage with minimal manual effort.

---

## Overview

AI Test Generator analyzes source code and produces high-quality unit tests (e.g., Jest) covering:

* Normal use cases
* Edge cases
* Error handling scenarios

It integrates with GitHub workflows to automatically create Pull Requests with generated tests — enabling seamless CI/CD integration.

---

## Features

* **LLM-powered test generation** (Gemini / OpenAI / Claude compatible)
* **Real-time test generation via WebSocket**
* **Auto Pull Request creation**
* **Docker-based execution environment**
* **Supports multiple code inputs dynamically**
* **Structured and clean test output (Jest-ready)**
* **Secure repo interaction using GitHub APIs**

---

## Tech Stack

### Frontend

* Next.js (TypeScript)
* WebSockets for real-time updates
* Tailwind / ShadCN UI

### Backend

* Node.js (Express / Hono)
* WebSocket Server
* LLM Integration (Gemini / OpenAI / Claude)

### DevOps

* Docker (isolated test execution)
* GitHub API (Repo fork + PR automation)

---

## How It Works

1. User submits code via UI
2. Backend sends code to LLM with structured prompt
3. LLM generates unit tests
4. Tests are parsed and validated
5. Repo is:

   * Forked
   * Updated with tests
   * PR is automatically created

---

## Prompt Strategy

The system uses a structured prompt like:

```
You are a senior software engineer.

Write Jest unit tests for the following code.
Include:
- normal cases
- edge cases
- proper assertions

Return ONLY valid Jest test code.
```

---

## Project Structure

```
├── frontend/          # Next.js app
├── backend/
│   ├── websocket/    # WebSocket server
│   ├── llm/          # LLM integration
│   ├── parser/       # JSON/test extraction logic
│   └── github/       # PR + repo automation
├── docker/           # Execution environment
└── README.md
```

---

## Getting Started

### 1. Clone the repo

```
git clone https://github.com/your-username/ai-test-generator.git
cd ai-test-generator
```

### 2. Install dependencies

```
cd backend
bun install

cd ../frontend
npm install
```

### 3. Setup environment variables

Create `.env` files:

```
GITHUB_TOKEN=your_token
LLM_API_KEY=your_key
```

---

### 4. Run the project

Backend:

```
bun src/index.ts
```

Frontend:

```
npm run dev
```

---

## WebSocket Flow

* Client connects to WebSocket server
* Sends code payload
* Receives:

  * Status updates
  * Generated test cases
  * Errors (if any)

---

## Docker Integration

* Runs test execution in an isolated container
* Prevents infinite loops / unsafe code execution
* Ensures reproducibility

---

## GitHub Automation

* Automatically forks the repository
* Adds generated test files
* Commits changes
* Creates a Pull Request

> This enables developers to review and merge AI-generated tests easily.

---

## Example Output

```js
describe("sum function", () => {
  test("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });

  test("handles negative numbers", () => {
    expect(sum(-1, -1)).toBe(-2);
  });
});
```

---

## Future Improvements

* Multi-language support (Python, Go, Java)
* Code coverage visualization
* Inline test suggestions in editor (VSCode extension)
* Fine-tuned model for better accuracy
* Retry + feedback loop for failed tests

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Make changes
4. Submit a PR

---

## License

MIT License

---

## Acknowledgements

* OpenAI / Google Gemini / Anthropic
* GitHub API
* Docker

---

## Author

**Ayush Kannaujiya**

* Full Stack Engineer
* Passionate about AI + Developer Tools

---

## Support

If you like this project, give it a star on GitHub!

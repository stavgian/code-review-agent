# Code Review Agent (Ollama + Node.js)

A lightweight, local AI code reviewer that analyzes your **staged git changes** and provides structured feedback.  
Everything runs on your machine using **Ollama**, so no code ever leaves your device.

## Features

- Reviews **only staged git diffs**
- Runs automatically before each commit (Husky pre-commit hook)
- Structured output: Summary, Issues, Suggestions
- Local and private — zero cloud usage
- Works with any language (diff-based)

## Requirements

- Node.js 18+
- Git
- Ollama installed and running locally

Install Ollama:  
https://ollama.com/download

## Installation

Clone this repository:

```bash
git clone https://github.com/<your-username>/code-review-agent.git
cd code-review-agent
npm install
```

Pull the model once:

```bash
npm run setup:ollama
```

(uses `llama3.1` by default)

## Usage

### 1. Stage your changes

```bash
git add <files>
```

### 2. Run the review manually

```bash
npm run review
```

### 3. Automatic review (pre-commit hook)

The project includes a Husky **pre-commit hook**.

Whenever you run:

```bash
git commit -m "your message"
```

the AI review executes automatically.

To skip the hook:

```bash
HUSKY=0 git commit -m "skip review"
```

## How it Works

- `review.js` collects the staged `git diff`
- Sends it to Ollama using the Chat API
- Ollama returns a human-readable code review
- Husky blocks/continues commits based on script completion

Everything is local.

## Example Output

```
=== CODE REVIEW ===

Summary:
- Minor formatting issues detected.

Issues:
1) [MEDIUM] Missing error handling
   - Function does not handle null input.

Suggestions:
- Add validation for input params.
- Consider extracting repeated logic into helpers.
```

## Configuration

To change the model, edit:

```js
model: "llama3.1"
```

in `review.js`.

Modify the system prompt there to adjust strictness or tone.

## Development

Run review without committing:

```bash
npm run review
```

Debug hook:

```bash
bash -x .husky/pre-commit
```

Make hook executable:

```bash
chmod +x .husky/pre-commit
```

## License

MIT

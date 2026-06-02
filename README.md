# Prompt Lens

A local-first prompt debugger that scores, rewrites, and structures prompts before you send them to an AI model.

Prompt Lens is a tiny static web app for developers, writers, product people, and students who want better AI results without sending their drafts to another server.

## Features

- Scores prompts across goal, context, constraints, output format, examples, and specificity
- Supports General, Coding, Writing, and Research scoring profiles
- Generates a cleaner rewritten prompt with missing sections marked clearly
- Flags common risks such as current-fact hallucination, missing source boundaries, high-stakes topics, and exposed secrets
- Includes quick templates for task, context, constraints, and output format
- Tracks word and character counts while you edit
- Copies or downloads the rewritten prompt as Markdown
- Saves your draft locally in the browser
- Runs fully in the browser with no backend, no login, and no tracking
- Ships as plain HTML, CSS, and JavaScript for easy GitHub Pages hosting

## Demo

Try the live demo: https://mm-sheng.github.io/prompt-lens/

## Quick Start

```bash
git clone https://github.com/MM-sheng/prompt-lens.git
cd prompt-lens
open index.html
```

You can also serve it locally:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## How It Works

Prompt Lens uses a transparent rule-based analyzer. Each check contributes to a 100-point score:

| Check | Points |
| --- | ---: |
| Clear goal | 20 |
| Useful context | 18 |
| Constraints | 16 |
| Output format | 18 |
| Examples | 12 |
| Specificity | 16 |

Profiles adjust the weighting for common workflows:

| Profile | Useful for |
| --- | --- |
| General | Everyday prompts and quick drafts |
| Coding | Review, debugging, implementation, and edge-case prompts |
| Writing | Copy, messaging, tone, audience, and structure prompts |
| Research | Comparison, tradeoff, recommendation, and source-aware prompts |

The rewrite panel preserves your original request and adds missing prompt sections so you can improve it quickly. Risk checks are intentionally conservative and visible, so users can understand why a warning appeared.

## Privacy

Prompt Lens runs entirely in your browser. It does not send prompts to a server, call an AI API, create an account, or track usage. Draft autosave uses `localStorage` on your own device.

## Roadmap

- Add custom user-defined scoring profiles
- Add import/export for prompt review sessions
- Add shareable prompt quality badges
- Add offline PWA support
- Add multilingual prompt checks
- Add test fixtures for the analyzer

## Good GitHub Topics

`prompt-engineering`, `ai-tools`, `productivity`, `static-site`, `javascript`, `github-pages`, `llm`

## Contributing

Small, focused contributions are welcome. Good first improvements include new risk rules, better examples, accessibility fixes, and test cases for the analyzer. Please keep the project dependency-free unless a dependency clearly improves the static app experience.

## License

MIT

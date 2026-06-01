# Prompt Lens

A local-first prompt debugger that scores, rewrites, and structures prompts before you send them to an AI model.

Prompt Lens is a tiny static web app for developers, writers, product people, and students who want better AI results without sending their drafts to another server.

## Features

- Scores prompts across goal, context, constraints, output format, examples, and specificity
- Generates a cleaner rewritten prompt with missing sections marked clearly
- Includes quick templates for task, context, constraints, and output format
- Runs fully in the browser with no backend, no login, and no tracking
- Ships as plain HTML, CSS, and JavaScript for easy GitHub Pages hosting

## Demo

Try the live demo: https://mm-sheng.github.io/prompt-lens/

## Screenshot

Add a screenshot after your first GitHub Pages deploy:

```md
![Prompt Lens screenshot](./screenshot.png)
```

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

Prompt Lens uses a simple rule-based analyzer. Each check contributes points to a 100-point score:

| Check | Points |
| --- | ---: |
| Clear goal | 20 |
| Useful context | 18 |
| Constraints | 16 |
| Output format | 18 |
| Examples | 12 |
| Specificity | 16 |

The rewrite panel preserves your original request and adds missing prompt sections so you can improve it quickly.

## Roadmap

- Export rewritten prompts as Markdown
- Add custom scoring profiles for coding, marketing, research, and education
- Add shareable prompt quality badges
- Add offline PWA support
- Add multilingual prompt checks

## Good GitHub Topics

`prompt-engineering`, `ai-tools`, `productivity`, `static-site`, `javascript`, `github-pages`, `llm`

## License

MIT

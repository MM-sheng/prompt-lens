# Contributing to Prompt Lens

Thanks for helping improve Prompt Lens. This project is intentionally small: plain HTML, CSS, and JavaScript with no build step.

## Local setup

```bash
git clone https://github.com/MM-sheng/prompt-lens.git
cd prompt-lens
python3 -m http.server 5173
```

Open `http://localhost:5173`.

## Good contributions

- Add prompt examples for real workflows.
- Improve scoring rules without making them opaque.
- Add risk checks for common prompt failure modes.
- Improve keyboard, screen reader, or mobile usability.
- Keep privacy intact: no tracking, no backend calls, no hidden API requests.

## Pull request checklist

- The app still works by opening `index.html` directly.
- The app still works through a static server.
- New UI text is clear and short.
- Rules are easy to understand from the code.
- README is updated when behavior changes.

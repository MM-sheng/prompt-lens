const promptInput = document.querySelector("#promptInput");
const scoreValue = document.querySelector("#scoreValue");
const rewriteOutput = document.querySelector("#rewriteOutput");
const checksList = document.querySelector("#checksList");
const fixesList = document.querySelector("#fixesList");
const gradeLabel = document.querySelector("#gradeLabel");
const fixCount = document.querySelector("#fixCount");
const copyRewrite = document.querySelector("#copyRewrite");

const examples = {
  product:
    "Write launch copy for a new habit tracking app. It should sound calm, premium, and practical. The audience is busy founders who want simple personal systems. Include a headline, subheadline, 3 feature bullets, and a short CTA.",
  code:
    "Review this React component for bugs and accessibility issues. Focus on keyboard navigation, state handling, and edge cases. Return findings by severity with file references and suggest small fixes before larger refactors.",
};

const checks = [
  {
    id: "goal",
    title: "Clear goal",
    points: 20,
    test: (text) =>
      /\b(write|create|build|explain|summarize|review|compare|debug|generate|analyze|设计|写|生成|分析|总结|解释|检查)\b/i.test(
        text,
      ),
    pass: "The prompt states what the model should do.",
    fail: "Add an explicit action verb and success target.",
  },
  {
    id: "context",
    title: "Useful context",
    points: 18,
    test: (text) =>
      /\b(audience|user|background|context|for|because|目标|用户|背景|场景|受众)\b/i.test(
        text,
      ) || text.length > 260,
    pass: "The model gets enough situational context.",
    fail: "Name the audience, scenario, source material, or reason.",
  },
  {
    id: "constraints",
    title: "Constraints",
    points: 16,
    test: (text) =>
      /\b(must|should|avoid|without|only|tone|style|limit|less than|不要|必须|风格|限制|语气)\b/i.test(
        text,
      ),
    pass: "The prompt includes boundaries or style guidance.",
    fail: "Add limits, tone, exclusions, or quality rules.",
  },
  {
    id: "format",
    title: "Output format",
    points: 18,
    test: (text) =>
      /\b(json|table|list|bullets|markdown|sections|format|headline|return|输出|格式|表格|列表|标题)\b/i.test(
        text,
      ),
    pass: "The desired response shape is visible.",
    fail: "Specify sections, bullets, JSON, table columns, or length.",
  },
  {
    id: "examples",
    title: "Examples",
    points: 12,
    test: (text) => /\b(example|sample|like this|例如|示例|参考)\b/i.test(text),
    pass: "The prompt gives the model a pattern to imitate.",
    fail: "Include one short example when style or structure matters.",
  },
  {
    id: "specificity",
    title: "Specificity",
    points: 16,
    test: (text) => text.trim().split(/\s+/).length >= 28 || text.length >= 120,
    pass: "The request is detailed enough to reduce guessing.",
    fail: "Add concrete nouns, numbers, inputs, and acceptance criteria.",
  },
];

const templates = {
  task: "Task:\n",
  context: "Context:\n- Audience:\n- Goal:\n- Source material:\n",
  constraints: "Constraints:\n- Tone:\n- Must include:\n- Avoid:\n",
  format: "Output format:\n- Section 1:\n- Section 2:\n- Length:\n",
};

function analyzePrompt(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      score: 0,
      grade: "Needs input",
      results: checks.map((check) => ({ ...check, ok: false })),
      fixes: ["Paste a prompt to start the analysis."],
      rewrite: "Your rewritten prompt will appear here.",
    };
  }

  const results = checks.map((check) => ({ ...check, ok: check.test(trimmed) }));
  const score = results.reduce(
    (total, result) => total + (result.ok ? result.points : 0),
    0,
  );
  const fixes = results
    .filter((result) => !result.ok)
    .map((result) => result.fail);

  return {
    score,
    grade: getGrade(score),
    results,
    fixes:
      fixes.length > 0
        ? fixes
        : ["This prompt is in good shape. Add an example if the task is high stakes."],
    rewrite: buildRewrite(trimmed, results),
  };
}

function getGrade(score) {
  if (score >= 85) return "Strong";
  if (score >= 65) return "Good draft";
  if (score >= 40) return "Needs detail";
  return "Too vague";
}

function buildRewrite(text, results) {
  const missing = new Set(
    results.filter((result) => !result.ok).map((result) => result.id),
  );

  const sections = [
    "Task:",
    text,
    "",
    "Context:",
    missing.has("context")
      ? "- Audience: [who this is for]\n- Background: [what the model should know]"
      : "- Use the context already provided in the original prompt.",
    "",
    "Constraints:",
    missing.has("constraints")
      ? "- Tone: [desired tone]\n- Must include: [required details]\n- Avoid: [unwanted content]"
      : "- Follow the style and limits from the original prompt.",
    "",
    "Output format:",
    missing.has("format")
      ? "- Return the answer as [bullets/table/JSON/sections]\n- Keep it to [length]"
      : "- Use the requested format.",
  ];

  if (missing.has("examples")) {
    sections.push("", "Example:", "[Add one short example of the desired result.]");
  }

  return sections.join("\n");
}

function render() {
  const analysis = analyzePrompt(promptInput.value);
  scoreValue.textContent = analysis.score;
  gradeLabel.textContent = analysis.grade;
  rewriteOutput.textContent = analysis.rewrite;
  fixCount.textContent = String(analysis.fixes.length);

  checksList.innerHTML = "";
  analysis.results.forEach((result) => {
    const row = document.createElement("div");
    row.className = "check-row";

    const dot = document.createElement("span");
    dot.className = `status-dot ${result.ok ? "pass" : "fail"}`;
    dot.textContent = result.ok ? "OK" : "!";

    const content = document.createElement("div");
    const title = document.createElement("p");
    title.className = "check-title";
    title.textContent = result.title;
    const detail = document.createElement("p");
    detail.className = "check-detail";
    detail.textContent = result.ok ? result.pass : result.fail;

    content.append(title, detail);
    row.append(dot, content);
    checksList.append(row);
  });

  fixesList.innerHTML = "";
  analysis.fixes.forEach((fix) => {
    const item = document.createElement("li");
    item.textContent = fix;
    fixesList.append(item);
  });
}

promptInput.addEventListener("input", render);

document.querySelector("#loadProduct").addEventListener("click", () => {
  promptInput.value = examples.product;
  render();
});

document.querySelector("#loadCode").addEventListener("click", () => {
  promptInput.value = examples.code;
  render();
});

document.querySelector("#clearPrompt").addEventListener("click", () => {
  promptInput.value = "";
  render();
  promptInput.focus();
});

document.querySelectorAll("[data-template]").forEach((button) => {
  button.addEventListener("click", () => {
    const template = templates[button.dataset.template];
    const separator = promptInput.value.endsWith("\n") || !promptInput.value ? "" : "\n\n";
    promptInput.value = `${promptInput.value}${separator}${template}`;
    promptInput.focus();
    render();
  });
});

copyRewrite.addEventListener("click", async () => {
  await navigator.clipboard.writeText(rewriteOutput.textContent);
  copyRewrite.textContent = "Copied";
  copyRewrite.classList.add("copied");
  window.setTimeout(() => {
    copyRewrite.textContent = "Copy";
    copyRewrite.classList.remove("copied");
  }, 1200);
});

promptInput.value = examples.product;
render();

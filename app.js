const promptInput = document.querySelector("#promptInput");
const scoreValue = document.querySelector("#scoreValue");
const rewriteOutput = document.querySelector("#rewriteOutput");
const checksList = document.querySelector("#checksList");
const fixesList = document.querySelector("#fixesList");
const gradeLabel = document.querySelector("#gradeLabel");
const fixCount = document.querySelector("#fixCount");
const copyRewrite = document.querySelector("#copyRewrite");
const downloadRewrite = document.querySelector("#downloadRewrite");
const promptStats = document.querySelector("#promptStats");
const profileHint = document.querySelector("#profileHint");
const risksList = document.querySelector("#risksList");
const riskCount = document.querySelector("#riskCount");

let activeProfile = "general";

const examples = {
  product:
    "Write launch copy for a new habit tracking app. It should sound calm, premium, and practical. The audience is busy founders who want simple personal systems. Include a headline, subheadline, 3 feature bullets, and a short CTA.",
  code:
    "Review this React component for bugs and accessibility issues. Focus on keyboard navigation, state handling, and edge cases. Return findings by severity with file references and suggest small fixes before larger refactors.",
  research:
    "Compare three approaches for adding offline support to a static web app: service workers, localStorage-only caching, and a PWA shell. Audience: a solo maintainer deciding what to build next. Include tradeoffs, implementation complexity, privacy considerations, and a recommendation table.",
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

const profiles = {
  general: {
    label: "General",
    hint: "Balanced checks for everyday prompts.",
    weights: {},
  },
  coding: {
    label: "Coding",
    hint: "Prioritizes constraints, edge cases, and output format.",
    weights: { constraints: 1.25, format: 1.2, examples: 0.85 },
  },
  writing: {
    label: "Writing",
    hint: "Prioritizes audience, voice, examples, and structure.",
    weights: { context: 1.25, examples: 1.2, format: 1.1 },
  },
  research: {
    label: "Research",
    hint: "Prioritizes context, comparison criteria, and source limits.",
    weights: { context: 1.25, constraints: 1.15, format: 1.15 },
  },
};

const riskRules = [
  {
    label: "May invite hallucination",
    test: (text) =>
      /\b(latest|recent|current|today|news|price|law|policy|现在|最新|今天|新闻|价格|法规)\b/i.test(
        text,
      ) && !/\b(source|cite|verify|browse|official|来源|引用|核实|官方)\b/i.test(text),
    fix: "Ask for sources, dates, and verification when the answer depends on current facts.",
  },
  {
    label: "No input boundary",
    test: (text) =>
      /\b(review|summarize|analyze|rewrite|检查|总结|分析|改写)\b/i.test(text) &&
      !/\b(text below|following|attached|paste|between|下面|以下|粘贴|附件)\b/i.test(text),
    fix: "Mark where the source material starts and ends so the model does not guess the input.",
  },
  {
    label: "High-stakes topic",
    test: (text) =>
      /\b(medical|legal|financial|diagnosis|contract|tax|investment|health|医疗|法律|金融|诊断|合同|税|投资|健康)\b/i.test(
        text,
      ),
    fix: "Request conservative guidance, uncertainty notes, and professional review for high-stakes topics.",
  },
  {
    label: "Could leak private data",
    test: (text) =>
      /\b(password|token|secret|api key|private key|credential|密码|令牌|密钥|凭证)\b/i.test(
        text,
      ),
    fix: "Remove secrets and replace them with redacted placeholders before using the prompt.",
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
  const weightedChecks = getWeightedChecks(activeProfile);
  if (!trimmed) {
    return {
      score: 0,
      grade: "Needs input",
      results: weightedChecks.map((check) => ({ ...check, ok: false })),
      fixes: ["Paste a prompt to start the analysis."],
      risks: ["Risk checks will appear after you enter a prompt."],
      rewrite: "Your rewritten prompt will appear here.",
    };
  }

  const results = weightedChecks.map((check) => ({ ...check, ok: check.test(trimmed) }));
  const totalPoints = results.reduce((total, result) => total + result.points, 0);
  const earnedPoints = results.reduce(
    (total, result) => total + (result.ok ? result.points : 0),
    0,
  );
  const score = Math.round((earnedPoints / totalPoints) * 100);
  const fixes = results
    .filter((result) => !result.ok)
    .map((result) => result.fail);
  const risks = riskRules
    .filter((rule) => rule.test(trimmed))
    .map((rule) => `${rule.label}: ${rule.fix}`);

  return {
    score,
    grade: getGrade(score),
    results,
    fixes:
      fixes.length > 0
        ? fixes
        : ["This prompt is in good shape. Add an example if the task is high stakes."],
    risks: risks.length > 0 ? risks : ["No obvious risk flags detected."],
    rewrite: buildRewrite(trimmed, results),
  };
}

function getWeightedChecks(profileId) {
  const profile = profiles[profileId] || profiles.general;
  return checks.map((check) => ({
    ...check,
    points: Math.round(check.points * (profile.weights[check.id] || 1)),
  }));
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
    "",
    "Quality bar:",
    "- State assumptions before answering.\n- Flag uncertainty instead of inventing details.\n- Ask a clarifying question if a missing input would change the answer.",
  ];

  if (missing.has("examples")) {
    sections.push("", "Example:", "[Add one short example of the desired result.]");
  }

  return sections.join("\n");
}

function render() {
  const analysis = analyzePrompt(promptInput.value);
  const words = promptInput.value.trim()
    ? promptInput.value.trim().split(/\s+/).filter(Boolean).length
    : 0;

  scoreValue.textContent = analysis.score;
  gradeLabel.textContent = analysis.grade;
  rewriteOutput.textContent = analysis.rewrite;
  fixCount.textContent = String(analysis.fixes.length);
  riskCount.textContent = String(
    analysis.risks[0] === "No obvious risk flags detected." ? 0 : analysis.risks.length,
  );
  promptStats.textContent = `${words} words · ${promptInput.value.length} characters`;
  profileHint.textContent = profiles[activeProfile].hint;

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

  risksList.innerHTML = "";
  analysis.risks.forEach((risk) => {
    const item = document.createElement("li");
    item.textContent = risk;
    risksList.append(item);
  });

  localStorage.setItem("prompt-lens:draft", promptInput.value);
  localStorage.setItem("prompt-lens:profile", activeProfile);
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

document.querySelector("#loadResearch").addEventListener("click", () => {
  promptInput.value = examples.research;
  activeProfile = "research";
  syncProfileButtons();
  render();
});

document.querySelector("#clearPrompt").addEventListener("click", () => {
  promptInput.value = "";
  render();
  promptInput.focus();
});

document.querySelectorAll("[data-profile]").forEach((button) => {
  button.addEventListener("click", () => {
    activeProfile = button.dataset.profile;
    syncProfileButtons();
    render();
  });
});

function syncProfileButtons() {
  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.classList.toggle("active", button.dataset.profile === activeProfile);
  });
}

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

downloadRewrite.addEventListener("click", () => {
  const markdown = `# Prompt Lens Rewrite\n\n${rewriteOutput.textContent}\n`;
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prompt-lens-rewrite.md";
  link.click();
  URL.revokeObjectURL(url);
});

activeProfile = localStorage.getItem("prompt-lens:profile") || "general";
promptInput.value = localStorage.getItem("prompt-lens:draft") || examples.product;
syncProfileButtons();
render();

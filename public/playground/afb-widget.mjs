// src/deviceInfo.ts
function currentWebDeviceInfo(opts) {
  const nav = typeof navigator !== "undefined" ? navigator : void 0;
  const uaData = nav?.userAgentData;
  const platform = uaData?.platform || nav?.platform || "Unknown";
  return {
    appName: opts.appName,
    appVersion: opts.appVersion,
    buildNumber: opts.buildNumber ?? "0",
    model: String(platform),
    osName: "Web",
    osVersion: nav?.userAgent ?? "Unknown"
  };
}

// src/widget.ts
var DEFAULT_COPY = {
  bug: "Bug",
  feature: "Feature request",
  title: "Summary",
  description: "What happened?",
  email: "Email (optional)",
  submit: "Send feedback",
  submitting: "Sending\u2026",
  success: "Thanks for the feedback!",
  error: "Something went wrong. Please try again.",
  validation: "Please add a summary and a description."
};
var STYLE = `
.afb-widget{--afb-accent:#3b82f6;font-family:system-ui,-apple-system,sans-serif;max-width:380px}
.afb-form{display:flex;flex-direction:column;gap:8px}
.afb-types{display:flex;gap:8px}
.afb-type{flex:1;padding:8px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font:inherit}
.afb-type[aria-checked="true"]{border-color:var(--afb-accent);color:var(--afb-accent);font-weight:600}
.afb-title,.afb-description,.afb-email{padding:8px;border:1px solid #d1d5db;border-radius:8px;font:inherit;width:100%;box-sizing:border-box}
.afb-title[aria-invalid="true"],.afb-description[aria-invalid="true"]{border-color:#dc2626}
.afb-description{min-height:84px;resize:vertical}
.afb-submit{padding:10px;border:0;border-radius:8px;background:var(--afb-accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.afb-submit:disabled{opacity:.6;cursor:default}
.afb-widget :focus-visible{outline:2px solid var(--afb-accent);outline-offset:2px}
.afb-status{font-size:14px;min-height:18px}
.afb-status[data-state="invalid"],.afb-status[data-state="error"]{color:#dc2626}
.afb-status[data-state="success"]{color:#16a34a}
`;
function elem(tag, className) {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}
function mountFeedbackWidget(target, options) {
  const copy = { ...DEFAULT_COPY, ...options.copy };
  let type = options.defaultType ?? "bug";
  const root = elem("div", "afb-widget");
  root.setAttribute("data-appfeedback", "widget");
  if (options.theme?.accent) root.style.setProperty("--afb-accent", options.theme.accent);
  const style = document.createElement("style");
  style.textContent = STYLE;
  root.appendChild(style);
  const types = elem("div", "afb-types");
  types.setAttribute("role", "radiogroup");
  types.setAttribute("aria-label", "Feedback type");
  const makeType = (t, label) => {
    const b = elem("button", "afb-type");
    b.type = "button";
    b.dataset.type = t;
    b.textContent = label;
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(t === type));
    b.tabIndex = t === type ? 0 : -1;
    return b;
  };
  const bugBtn = makeType("bug", copy.bug);
  const featBtn = makeType("feature-request", copy.feature);
  types.append(bugBtn, featBtn);
  const form = document.createElement("form");
  form.className = "afb-form";
  form.setAttribute("aria-label", copy.submit);
  form.noValidate = true;
  const titleInput = elem("input", "afb-title");
  titleInput.type = "text";
  titleInput.placeholder = copy.title;
  titleInput.setAttribute("aria-label", copy.title);
  titleInput.setAttribute("aria-required", "true");
  const descInput = elem("textarea", "afb-description");
  descInput.placeholder = copy.description;
  descInput.setAttribute("aria-label", copy.description);
  descInput.setAttribute("aria-required", "true");
  const emailInput = elem("input", "afb-email");
  emailInput.type = "email";
  emailInput.placeholder = copy.email;
  emailInput.setAttribute("aria-label", copy.email);
  const submitBtn = elem("button", "afb-submit");
  submitBtn.type = "submit";
  submitBtn.textContent = copy.submit;
  const status = elem("div", "afb-status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  function setType(t) {
    type = t;
    const radios = [[bugBtn, "bug"], [featBtn, "feature-request"]];
    for (const [btn, value] of radios) {
      const checked = value === t;
      btn.setAttribute("aria-checked", String(checked));
      btn.tabIndex = checked ? 0 : -1;
    }
  }
  bugBtn.addEventListener("click", () => setType("bug"));
  featBtn.addEventListener("click", () => setType("feature-request"));
  const moveType = (next, focusBtn) => {
    setType(next);
    focusBtn.focus();
  };
  for (const btn of [bugBtn, featBtn]) {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        moveType("feature-request", featBtn);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        moveType("bug", bugBtn);
      }
    });
  }
  const clearInvalidOn = (el) => {
    el.addEventListener("input", () => {
      if (el.value.trim()) el.removeAttribute("aria-invalid");
    });
  };
  clearInvalidOn(titleInput);
  clearInvalidOn(descInput);
  function setStatus(text, state) {
    status.textContent = text;
    status.dataset.state = state;
    const assertive = state === "error" || state === "invalid";
    status.setAttribute("role", assertive ? "alert" : "status");
    status.setAttribute("aria-live", assertive ? "assertive" : "polite");
  }
  async function submit() {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    titleInput.setAttribute("aria-invalid", String(!title));
    descInput.setAttribute("aria-invalid", String(!description));
    if (!title || !description) {
      setStatus(copy.validation, "invalid");
      (!title ? titleInput : descInput).focus();
      return;
    }
    titleInput.removeAttribute("aria-invalid");
    descInput.removeAttribute("aria-invalid");
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.textContent = copy.submitting;
    setStatus("", "submitting");
    const report = {
      type,
      title,
      description,
      contactEmail: emailInput.value.trim() || null,
      extraFields: {}
    };
    const device = currentWebDeviceInfo({
      appName: options.appName,
      appVersion: options.appVersion,
      buildNumber: options.buildNumber
    });
    try {
      const issueNumber = await options.transport.submit(report, device);
      setStatus(copy.success, "success");
      submitBtn.removeAttribute("aria-busy");
      root.dataset.submitted = String(issueNumber);
      options.onSubmit?.(issueNumber);
    } catch (error) {
      setStatus(copy.error, "error");
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
      submitBtn.textContent = copy.submit;
      options.onError?.(error);
    }
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void submit();
  });
  form.append(types, titleInput, descInput, emailInput, submitBtn, status);
  root.appendChild(form);
  target.appendChild(root);
  return { root, unmount: () => root.remove() };
}

// ../core/src/bodyMarkers.ts
var DEVICE_HEADER = "Device Information:";
var APP_LABEL = "App:";
var APP_VERSION_LABEL = "App Version:";
var DEVICE_LABEL = "Device:";
var OS_VERSION_SUFFIX = " Version:";
var CONTACT_EMAIL_LABEL = "Contact Email:";
var HORIZONTAL_RULE = "---";
var VOTES_FOOTER = "\u{1F44D} Votes: 0";
var ATTACHMENTS_OPEN = "<!-- attachments-v1 -->";
var ATTACHMENTS_CLOSE = "<!-- /attachments-v1 -->";
var ATTACHMENTS_HEADER = "## Attachments";
var RECOGNISED_OS_NAMES = [
  "OS",
  "macOS",
  "iOS",
  "iPadOS",
  "watchOS",
  "tvOS",
  "visionOS",
  "Android",
  "Windows",
  "Linux",
  "Web",
  "ChromeOS"
];
var OS_VERSION_REGEX = new RegExp(`^(${RECOGNISED_OS_NAMES.join("|")}) Version:`, "i");

// ../core/src/deviceInfo.ts
function renderDeviceInfo(d) {
  return `${APP_LABEL} ${d.appName}
${APP_VERSION_LABEL} ${d.appVersion} (${d.buildNumber})
${DEVICE_LABEL} ${d.model}
${d.osName}${OS_VERSION_SUFFIX} ${d.osVersion}`;
}

// ../core/src/deterministicByteCount.ts
function deterministicByteCount(bytes) {
  const b = Math.min(Math.max(0, Math.trunc(bytes)), 1e14);
  const units = [
    ["GB", 1e9],
    ["MB", 1e6],
    ["KB", 1e3]
  ];
  for (const [name, factor] of units) {
    if (b >= factor) {
      const tenths = Math.floor((b * 10 + Math.floor(factor / 2)) / factor);
      const whole = Math.floor(tenths / 10);
      const frac = tenths % 10;
      return frac === 0 ? `${whole} ${name}` : `${whole}.${frac} ${name}`;
    }
  }
  return `${b} B`;
}

// ../core/src/issueBodyFormatter.ts
var USER_SUBMITTED_LABEL = "user-submitted";
function codePointOrder(a, b) {
  const ca = [...a];
  const cb = [...b];
  const n = Math.min(ca.length, cb.length);
  for (let i = 0; i < n; i++) {
    const d = ca[i].codePointAt(0) - cb[i].codePointAt(0);
    if (d !== 0) return d;
  }
  return ca.length - cb.length;
}
function labelsFor(type) {
  return [type, USER_SUBMITTED_LABEL];
}
function formatIssueBody(report, deviceInfo, uploaded = []) {
  let body = report.description;
  body += `

${HORIZONTAL_RULE}
**${DEVICE_HEADER}**
${renderDeviceInfo(deviceInfo)}`;
  if (report.contactEmail && report.contactEmail.length > 0) {
    body += `

**${CONTACT_EMAIL_LABEL}**
${report.contactEmail}`;
  }
  const extra = report.extraFields ?? {};
  for (const key of Object.keys(extra).sort(codePointOrder)) {
    body += `

**${key}:**
${extra[key]}`;
  }
  if (uploaded.length > 0) {
    body += `

${ATTACHMENTS_OPEN}
${ATTACHMENTS_HEADER}
`;
    for (const a of uploaded) {
      const prefix = a.mimeType.startsWith("image/") ? "!" : "";
      const size = deterministicByteCount(a.sizeBytes);
      body += `
${prefix}[${a.filename}](${a.url}) \u2014 ${a.mimeType}, ${size}
`;
    }
    body += `
${ATTACHMENTS_CLOSE}`;
  }
  body += `

${HORIZONTAL_RULE}
${VOTES_FOOTER}`;
  return body;
}
export {
  currentWebDeviceInfo,
  formatIssueBody,
  labelsFor,
  mountFeedbackWidget
};

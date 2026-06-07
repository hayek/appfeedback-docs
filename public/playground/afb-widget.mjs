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
.afb-widget{--afb-accent:#3b82f6;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;gap:8px;max-width:380px}
.afb-types{display:flex;gap:8px}
.afb-type{flex:1;padding:8px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font:inherit}
.afb-type[aria-pressed="true"]{border-color:var(--afb-accent);color:var(--afb-accent);font-weight:600}
.afb-title,.afb-description,.afb-email{padding:8px;border:1px solid #d1d5db;border-radius:8px;font:inherit;width:100%;box-sizing:border-box}
.afb-description{min-height:84px;resize:vertical}
.afb-submit{padding:10px;border:0;border-radius:8px;background:var(--afb-accent);color:#fff;font:inherit;font-weight:600;cursor:pointer}
.afb-submit:disabled{opacity:.6;cursor:default}
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
  types.setAttribute("role", "group");
  const makeType = (t, label) => {
    const b = elem("button", "afb-type");
    b.type = "button";
    b.dataset.type = t;
    b.textContent = label;
    b.setAttribute("aria-pressed", String(t === type));
    return b;
  };
  const bugBtn = makeType("bug", copy.bug);
  const featBtn = makeType("feature-request", copy.feature);
  types.append(bugBtn, featBtn);
  const titleInput = elem("input", "afb-title");
  titleInput.type = "text";
  titleInput.placeholder = copy.title;
  titleInput.setAttribute("aria-label", copy.title);
  const descInput = elem("textarea", "afb-description");
  descInput.placeholder = copy.description;
  descInput.setAttribute("aria-label", copy.description);
  const emailInput = elem("input", "afb-email");
  emailInput.type = "email";
  emailInput.placeholder = copy.email;
  emailInput.setAttribute("aria-label", copy.email);
  const submitBtn = elem("button", "afb-submit");
  submitBtn.type = "button";
  submitBtn.textContent = copy.submit;
  const status = elem("div", "afb-status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  function setType(t) {
    type = t;
    bugBtn.setAttribute("aria-pressed", String(t === "bug"));
    featBtn.setAttribute("aria-pressed", String(t === "feature-request"));
  }
  bugBtn.addEventListener("click", () => setType("bug"));
  featBtn.addEventListener("click", () => setType("feature-request"));
  function setStatus(text, state) {
    status.textContent = text;
    status.dataset.state = state;
  }
  async function submit() {
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    if (!title || !description) {
      setStatus(copy.validation, "invalid");
      return;
    }
    submitBtn.disabled = true;
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
      root.dataset.submitted = String(issueNumber);
      options.onSubmit?.(issueNumber);
    } catch (error) {
      setStatus(copy.error, "error");
      submitBtn.disabled = false;
      submitBtn.textContent = copy.submit;
      options.onError?.(error);
    }
  }
  submitBtn.addEventListener("click", () => {
    void submit();
  });
  root.append(types, titleInput, descInput, emailInput, submitBtn, status);
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

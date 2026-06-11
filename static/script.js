/**
 * ConcreteAI — script.js
 * Concrete Compressive Strength Prediction System
 * Handles: Loader, Theme, Navbar, Scroll animations, Counters,
 *          Chart.js, Form validation, Result display
 */

"use strict";

/* ─── DOM READY ──────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initThemeToggle();
  initParticles();
  initNavbarScroll();
  initScrollAnimations();
  initCounters();
  initHeroCounters();
  initFeatureChart();
  initForm();
  initResultFromServer();
});

/* ═══════════════════════════════════════════════════════════════════
   1. LOADER
   ═══════════════════════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 1200);
  });

  // Fallback: always hide after 3s
  setTimeout(() => loader.classList.add("hidden"), 3000);
}

/* ═══════════════════════════════════════════════════════════════════
   2. DARK / LIGHT THEME TOGGLE
   ═══════════════════════════════════════════════════════════════════ */
function initThemeToggle() {
  const btn  = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  const html = document.documentElement;

  // Restore saved preference
  const saved = localStorage.getItem("concreteai-theme") || "dark";
  html.setAttribute("data-theme", saved);
  updateThemeIcon(icon, saved);

  btn?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next    = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("concreteai-theme", next);
    updateThemeIcon(icon, next);
    updateChartTheme(next);
  });
}

function updateThemeIcon(icon, theme) {
  if (!icon) return;
  icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-fill";
}

/* ═══════════════════════════════════════════════════════════════════
   3. HERO PARTICLES
   ═══════════════════════════════════════════════════════════════════ */
function initParticles() {
  const container = document.getElementById("heroParticles");
  if (!container) return;

  const count = window.innerWidth < 768 ? 12 : 22;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");
    const size = Math.random() * 12 + 4;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   4. NAVBAR SCROLL EFFECT
   ═══════════════════════════════════════════════════════════════════ */
function initNavbarScroll() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const navLinks = document.querySelectorAll(".nav-link[href^='#']");

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);

    // Active link highlight
    let current = "";
    document.querySelectorAll("section[id]").forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════════════════════
   5. SCROLL ANIMATIONS (Manual IntersectionObserver)
   ═══════════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const elements = document.querySelectorAll("[data-aos]");
  const bars     = document.querySelectorAll(".feat-bar");
  const statCards= document.querySelectorAll(".stat-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
        setTimeout(() => el.classList.add("animated"), delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach((el) => observer.observe(el));

  // Feature bars
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("animated"), 200);
        barObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );
  bars.forEach((b) => barObserver.observe(b));

  // Stat card progress bars
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add("bar-animated"), 400);
        cardObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );
  statCards.forEach((c) => cardObserver.observe(c));
}

/* ═══════════════════════════════════════════════════════════════════
   6. NUMBER COUNTERS (About section cards)
   ═══════════════════════════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll(".counter[data-target]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
}

function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const suffix   = el.dataset.suffix || "";
  const duration = 1600;
  const start    = performance.now();

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const val      = target * ease;
    el.textContent = val.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════════════════
   7. HERO STAT COUNTERS
   ═══════════════════════════════════════════════════════════════════ */
function initHeroCounters() {
  const vals = document.querySelectorAll(".hero-stat-value[data-count]");
  if (!vals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseFloat(el.dataset.count);
        const sfx = el.dataset.suffix || "";
        const dur = 1800;
        const dec = end % 1 !== 0 ? 2 : 0;
        const s   = performance.now();
        const tick= (now) => {
          const p = Math.min((now - s) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * e).toFixed(dec) + sfx;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  vals.forEach((v) => observer.observe(v));
}

/* ═══════════════════════════════════════════════════════════════════
   8. CHART.JS — Feature Importance Horizontal Bar
   ═══════════════════════════════════════════════════════════════════ */
let featureChartInstance = null;

function initFeatureChart() {
  const ctx = document.getElementById("featureChart");
  if (!ctx) return;

  const labels = [
    "Cement",
    "Water",
    "Age (Days)",
    "Fine Aggregate",
    "Coarse Aggregate",
    "Fly Ash",
    "Slag",
    "Superplasticizer",
  ];

  const data   = [31, 22, 18, 10, 9, 5, 3, 2];
  const colors = [
    "#2563EB", "#0EA5E9", "#22C55E", "#A855F7",
    "#F59E0B", "#EF4444", "#EC4899", "#14B8A6",
  ];

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

  featureChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Importance (%)",
          data,
          backgroundColor: colors.map((c) => c + "CC"),
          borderColor:      colors,
          borderWidth:      2,
          borderRadius:     8,
          borderSkipped:    false,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#0D1B2E" : "#1E293B",
          titleColor: "#F1F5F9",
          bodyColor:  "#94A3B8",
          padding:    12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => `  Importance: ${ctx.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 40,
          grid: {
            color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            drawBorder: false,
          },
          ticks: {
            color: isDark ? "#64748B" : "#94A3B8",
            font: { family: "'Inter', sans-serif", size: 11 },
            callback: (v) => v + "%",
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: isDark ? "#94A3B8" : "#475569",
            font: { family: "'Poppins', sans-serif", size: 12, weight: "600" },
          },
        },
      },
    },
  });
}

function updateChartTheme(theme) {
  if (!featureChartInstance) return;
  const isDark = theme === "dark";
  featureChartInstance.options.plugins.tooltip.backgroundColor = isDark ? "#0D1B2E" : "#1E293B";
  featureChartInstance.options.scales.x.grid.color = isDark
    ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  featureChartInstance.options.scales.x.ticks.color = isDark ? "#64748B" : "#94A3B8";
  featureChartInstance.options.scales.y.ticks.color = isDark ? "#94A3B8" : "#475569";
  featureChartInstance.update();
}

/* ═══════════════════════════════════════════════════════════════════
   9. FORM — Validation + Submission
   ═══════════════════════════════════════════════════════════════════ */
function initForm() {
  const form     = document.getElementById("predictionForm");
  const resetBtn = document.getElementById("resetBtn");
  const predictBtn     = document.getElementById("predictBtn");
  const predictBtnText = document.getElementById("predictBtnText");
  const predictSpinner = document.getElementById("predictBtnSpinner");

  if (!form) return;

  /* ── Client-side validation helper ── */
  function validateField(input) {
    const val = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const ok  = !isNaN(val) && val >= min && val <= max;
    input.classList.toggle("is-invalid", !ok);
    input.classList.toggle("is-valid",    ok);
    return ok;
  }

  /* Live validation */
  form.querySelectorAll(".modern-input").forEach((inp) => {
    inp.addEventListener("input", () => validateField(inp));
    inp.addEventListener("blur",  () => { if (inp.value !== "") validateField(inp); });
  });

  /* ── Form submit ── */
  form.addEventListener("submit", (e) => {
    let allValid = true;
    form.querySelectorAll(".modern-input").forEach((inp) => {
      if (!validateField(inp)) allValid = false;
    });

    if (!allValid) {
      e.preventDefault();
      // Scroll to first invalid
      const first = form.querySelector(".is-invalid");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Show loading state
    predictBtn.disabled     = true;
    predictBtnText.textContent = "Predicting…";
    predictSpinner.classList.remove("d-none");
  });

  /* ── Reset ── */
  resetBtn?.addEventListener("click", () => {
    form.querySelectorAll(".modern-input").forEach((inp) => {
      inp.value = "";
      inp.classList.remove("is-valid", "is-invalid");
    });
    hideResult();
    predictBtn.disabled = false;
    predictBtnText.textContent = "Predict Strength";
    predictSpinner.classList.add("d-none");
  });
}

/* ═══════════════════════════════════════════════════════════════════
   10. RESULT DISPLAY
   ═══════════════════════════════════════════════════════════════════ */
function initResultFromServer() {
  // If Flask rendered a prediction value, parse and display it
  const serverResult = document.querySelector(".alert-success-custom");
  if (serverResult) {
    // Extract number from text like "Predicted Strength: 48.72 MPa"
    const match = serverResult.textContent.match(/([\d.]+)/);
    if (match) {
      showResult(parseFloat(match[1]));
    } else {
      // Show result section anyway
      document.getElementById("resultSection").style.removeProperty("display");
    }
  }
}

/**
 * Programmatic result display (for future AJAX use or client-side demo)
 * @param {number} mpa — predicted MPa value
 */
function showResult(mpa) {
  const section = document.getElementById("resultSection");
  if (!section) return;
  section.style.removeProperty("display");
  section.style.display = "block";

  // Animate number count-up
  animateResultNum(mpa);

  // Circular progress (max reference ~80 MPa)
  animateCircular(mpa, 80);

  // Strength classification
  classifyStrength(mpa);

  // Scroll to result
  setTimeout(() => {
    section.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);

  // Confetti burst
  burstConfetti(section);
}

function hideResult() {
  const section = document.getElementById("resultSection");
  if (section) {
    section.style.display = "none";
  }
}

function animateResultNum(target) {
  const el      = document.getElementById("resultNum");
  const elVal   = document.getElementById("resultValue");
  if (!el || !elVal) return;

  const duration = 1800;
  const start    = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const val      = (target * ease).toFixed(2);
    el.textContent    = val;
    elVal.textContent = val;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function animateCircular(value, max) {
  const fill        = document.getElementById("cpFill");
  if (!fill) return;
  const circumference = 2 * Math.PI * 68; // r=68
  const ratio        = Math.min(value / max, 1);
  const offset       = circumference * (1 - ratio);
  // Trigger CSS transition
  requestAnimationFrame(() => {
    fill.style.strokeDasharray  = circumference;
    fill.style.strokeDashoffset = circumference;
    requestAnimationFrame(() => {
      fill.style.strokeDashoffset = offset;
    });
  });
}

function classifyStrength(mpa) {
  const badge = document.getElementById("resultClassBadge");
  if (!badge) return;

  let label, bg, color;
  if      (mpa < 20)  { label="Low Strength (< 20 MPa)";     bg="rgba(239,68,68,0.1)";   color="#EF4444"; }
  else if (mpa < 35)  { label="Normal Strength (20–35 MPa)";  bg="rgba(245,158,11,0.1)";  color="#F59E0B"; }
  else if (mpa < 55)  { label="High Strength (35–55 MPa)";    bg="rgba(14,165,233,0.1)";  color="#0EA5E9"; }
  else                { label="Ultra-High Strength (> 55 MPa)";bg="rgba(34,197,94,0.1)"; color="#22C55E"; }

  badge.textContent = label;
  badge.style.background = bg;
  badge.style.color      = color;
  badge.style.border     = `1px solid ${color}40`;
}

/* ─── Confetti ────────────────────────────────────────────────────── */
function burstConfetti(anchor) {
  const colors = ["#2563EB","#0EA5E9","#22C55E","#A855F7","#F59E0B"];
  const rect   = anchor.getBoundingClientRect();
  const cx     = rect.left + rect.width / 2;

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("div");
    dot.classList.add("confetti-dot");
    dot.style.cssText = `
      left: ${cx + (Math.random() - 0.5) * 200}px;
      top: ${rect.top + window.scrollY + 20}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      position: absolute;
      animation-delay: ${Math.random() * 0.4}s;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1200);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   11. SMOOTH SCROLL for all anchor links
   ═══════════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    // Close mobile navbar if open
    const navCollapse = document.getElementById("navMenu");
    if (navCollapse?.classList.contains("show")) {
      navCollapse.classList.remove("show");
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════
   12. EXPOSE showResult globally for Flask response handling
       (e.g., if Flask returns JSON and you switch to AJAX later)
   ═══════════════════════════════════════════════════════════════════ */
window.ConcreteAI = { showResult, hideResult };

/* ═══════════════════════════════════════════════════════════════════
   13. INPUT MODE SWITCHER (Form ↔ Sliders)
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Switch between the typed-form panel and the slider dashboard panel.
 * @param {'form'|'slider'} mode
 */
function switchInputMode(mode) {
  const formPanel   = document.getElementById("formPanel");
  const sliderPanel = document.getElementById("sliderPanel");
  const tabForm     = document.getElementById("tabForm");
  const tabSlider   = document.getElementById("tabSlider");

  if (mode === "form") {
    formPanel.style.display   = "";
    sliderPanel.style.display = "none";
    tabForm.classList.add("active");
    tabSlider.classList.remove("active");
  } else {
    formPanel.style.display   = "none";
    sliderPanel.style.display = "";
    tabForm.classList.remove("active");
    tabSlider.classList.add("active");
    // Initialize slider visuals on first reveal
    initSliders();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   14. SLIDER SYSTEM
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Configuration for every slider parameter.
 * Maps field name -> { min, max, default, step, unit }
 */
const SLIDER_CONFIG = {
  cement:           { min: 100,  max: 600,  def: 300,  step: 1,   unit: "kg/m³" },
  slag:             { min: 0,    max: 400,  def: 100,  step: 1,   unit: "kg/m³" },
  flyash:           { min: 0,    max: 250,  def: 50,   step: 1,   unit: "kg/m³" },
  water:            { min: 100,  max: 250,  def: 180,  step: 1,   unit: "kg/m³" },
  superplasticizer: { min: 0,    max: 35,   def: 10,   step: 0.1, unit: "kg/m³" },
  coarseaggregate:  { min: 700,  max: 1200, def: 1000, step: 1,   unit: "kg/m³" },
  fineaggregate:    { min: 500,  max: 1000, def: 750,  step: 1,   unit: "kg/m³" },
  age:              { min: 1,    max: 365,  def: 28,   step: 1,   unit: "Days"  },
};

let slidersInitialized = false;

/** Wire up all sliders — called once on first switch to slider mode */
function initSliders() {
  if (slidersInitialized) return;
  slidersInitialized = true;

  Object.keys(SLIDER_CONFIG).forEach((key) => {
    const cfg    = SLIDER_CONFIG[key];
    const range  = document.getElementById(`sr-${key}`);
    const numbox = document.getElementById(`sv-${key}`);
    if (!range || !numbox) return;

    // Initial visual sync
    updateSliderVisuals(key, cfg.def);

    /* ── Range → numbox + form field ── */
    range.addEventListener("input", () => {
      const val = parseFloat(range.value);
      numbox.value = key === "superplasticizer" ? val.toFixed(1) : val;
      updateSliderVisuals(key, val);
      syncToFormField(key, val);
    });

    /* ── Numbox → range + form field ── */
    numbox.addEventListener("input", () => {
      let val = parseFloat(numbox.value);
      if (isNaN(val)) return;
      val = Math.max(cfg.min, Math.min(cfg.max, val));
      range.value = val;
      updateSliderVisuals(key, val);
      syncToFormField(key, val);
    });

    numbox.addEventListener("blur", () => {
      let val = parseFloat(numbox.value);
      if (isNaN(val) || val < cfg.min) val = cfg.min;
      if (val > cfg.max)               val = cfg.max;
      numbox.value = key === "superplasticizer" ? val.toFixed(1) : val;
      range.value  = val;
      updateSliderVisuals(key, val);
      syncToFormField(key, val);
    });

    // Keyboard accessibility: arrow keys step faster with Shift
    range.addEventListener("keydown", (e) => {
      const big = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft"  || e.key === "ArrowDown")  {
        e.preventDefault();
        const v = Math.max(cfg.min, parseFloat(range.value) - big * cfg.step);
        range.value = v;
        range.dispatchEvent(new Event("input"));
      }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        const v = Math.min(cfg.max, parseFloat(range.value) + big * cfg.step);
        range.value = v;
        range.dispatchEvent(new Event("input"));
      }
    });
  });

  // Header Reset button
  document.getElementById("sliderResetBtn")?.addEventListener("click", resetSliders);

  // Initial mix preview
  updateMixPreview();
}

/**
 * Update all visual elements of a single slider.
 * @param {string} key     - slider field key
 * @param {number} value   - current value
 */
function updateSliderVisuals(key, value) {
  const cfg  = SLIDER_CONFIG[key];
  const fill = document.getElementById(`sf-${key}`);
  const tip  = document.getElementById(`st-${key}`);
  const pbar = document.getElementById(`spb-${key}`);
  const plbl = document.getElementById(`spl-${key}`);

  const pct = ((value - cfg.min) / (cfg.max - cfg.min)) * 100;
  const pctStr = pct.toFixed(0) + "%";

  // Gradient-filled track
  if (fill) fill.style.width = pctStr;

  // Floating tooltip — position above thumb
  if (tip) {
    const label = key === "age"
      ? `${value} Days`
      : `${key === "superplasticizer" ? parseFloat(value).toFixed(1) : value} kg/m³`;
    tip.textContent = label;
    // X-position: align center with thumb
    const sliderEl = document.getElementById(`sr-${key}`);
    if (sliderEl) {
      const sliderW = sliderEl.offsetWidth || 200;
      const thumbX  = (pct / 100) * sliderW;
      tip.style.left = `${thumbX}px`;
      tip.style.transform = "translateX(-50%)";
    }
  }

  // Percentage bar + label
  if (pbar) pbar.style.width = pctStr;
  if (plbl) plbl.textContent = pctStr;

  // Update mix preview if it's one of the 4 tracked materials
  if (["cement","slag","flyash","water"].includes(key)) {
    updateMixPreview();
  }
}

/** Update the horizontal stacked mix proportion bar */
function updateMixPreview() {
  const vals = {
    cement: parseFloat(document.getElementById("sr-cement")?.value  || 300),
    slag:   parseFloat(document.getElementById("sr-slag")?.value    || 100),
    flyash: parseFloat(document.getElementById("sr-flyash")?.value  || 50),
    water:  parseFloat(document.getElementById("sr-water")?.value   || 180),
  };
  const total = vals.cement + vals.slag + vals.flyash + vals.water || 1;

  const segs = {
    cement: document.getElementById("mixSegCement"),
    slag:   document.getElementById("mixSegSlag"),
    flyash: document.getElementById("mixSegFlyash"),
    water:  document.getElementById("mixSegWater"),
  };

  Object.keys(segs).forEach((k) => {
    if (segs[k]) {
      segs[k].style.flexGrow = ((vals[k] / total) * 100).toFixed(2);
    }
  });
}

/**
 * Sync a slider value back to the corresponding hidden form input
 * so that when the form is submitted it carries slider values.
 * @param {string} key
 * @param {number} value
 */
function syncToFormField(key, value) {
  const formField = document.getElementById(key);
  if (formField) {
    formField.value = value;
  }
}

/** Reset all sliders to their default values */
function resetSliders() {
  Object.keys(SLIDER_CONFIG).forEach((key) => {
    const cfg    = SLIDER_CONFIG[key];
    const range  = document.getElementById(`sr-${key}`);
    const numbox = document.getElementById(`sv-${key}`);
    if (range)  range.value  = cfg.def;
    if (numbox) numbox.value = key === "superplasticizer"
      ? cfg.def.toFixed(1)
      : cfg.def;
    updateSliderVisuals(key, cfg.def);
    syncToFormField(key, cfg.def);
  });

  // Brief flash animation on the reset button
  const btn = document.getElementById("sliderResetBtn");
  if (btn) {
    btn.style.transform = "rotate(-360deg) scale(1.1)";
    btn.style.transition = "transform 0.5s cubic-bezier(0.4,0,0.2,1)";
    setTimeout(() => {
      btn.style.transform = "";
      btn.style.transition = "";
    }, 550);
  }
}

/**
 * Copy slider values into the hidden form fields and submit the
 * existing Flask form — so no backend changes are needed.
 */
function submitFromSliders() {
  // Ensure all slider values are synced to form inputs
  Object.keys(SLIDER_CONFIG).forEach((key) => {
    const range = document.getElementById(`sr-${key}`);
    if (range) syncToFormField(key, parseFloat(range.value));
  });

  // Submit the main form
  const form = document.getElementById("predictionForm");
  if (form) {
    // Show spinner on the slider predict button
    const btn = document.getElementById("sliderPredictBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-cpu-fill me-2"></i>Predicting… <span class="spinner-border spinner-border-sm ms-2"></span>';
    }
    form.submit();
  }
}

/* ─── Auto-init sliders on DOMContentLoaded if panel is visible ── */
document.addEventListener("DOMContentLoaded", () => {
  // Already initialized if sliderPanel is visible at page load
  const sp = document.getElementById("sliderPanel");
  if (sp && sp.style.display !== "none") initSliders();
});


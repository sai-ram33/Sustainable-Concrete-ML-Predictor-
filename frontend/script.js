/* ============================================================
   Sustainable Concrete ML Predictor — Script
   Frontend-only demo behavior
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  // Render Lucide icons
  if (window.lucide) lucide.createIcons();

  initChart();
  initPredict();
  initModals();
  initMobileMenu();
  initValidation();


});

/* -------------------- CHART -------------------- */
let strengthChart;

function initChart() {
  const canvas = document.getElementById("strengthChart");
  if (!canvas || !window.Chart) return;

  const ctx = canvas.getContext("2d");
  const labels = ["3 Days", "7 Days", "28 Days", "90 Days"];

  const gradient = (color) => {
    const g = ctx.createLinearGradient(0, 0, 0, 350);
    g.addColorStop(0, color + "33");
    g.addColorStop(1, color + "00");
    return g;
  };

  strengthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Compressive Strength (MPa)",
          data: [24.1, 31.65, 48.62, 62.31],
          borderColor: "#2563eb",
          backgroundColor: gradient("#2563eb"),
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#2563eb",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: "Split Tensile Strength (MPa)",
          data: [3.22, 4.12, 3.85, 4.92],
          borderColor: "#22c55e",
          backgroundColor: gradient("#22c55e"),
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#22c55e",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: "Flexural Strength (MPa)",
          data: [3.22, 4.12, 5.87, 7.23],
          borderColor: "#f97316",
          backgroundColor: gradient("#f97316"),
          fill: true,
          tension: 0.35,
          pointBackgroundColor: "#f97316",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 14,
            font: { size: 11, family: "Inter, sans-serif" },
            color: "#475069",
          },
        },
        tooltip: {
          backgroundColor: "#0f1b35",
          padding: 10,
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Age (Days)",
            font: { size: 11, weight: "600", family: "Inter, sans-serif" },
            color: "#6b7488",
          },
          grid: { display: false },
          ticks: { font: { size: 11 }, color: "#6b7488" },
        },
        y: {
          title: {
            display: true,
            text: "Strength (MPa)",
            font: { size: 11, weight: "600", family: "Inter, sans-serif" },
            color: "#6b7488",
          },
          beginAtZero: true,
          grid: { color: "#eef0f5" },
          ticks: { font: { size: 11 }, color: "#6b7488" },
        },
      },
    },
  });
}

/* -------------------- PREDICT BUTTON -------------------- */
function initPredict() {
  const btn = document.getElementById("predictBtn");
  if (!btn) return;

  const textEl = btn.querySelector(".predict-btn-text");
  const spinEl = btn.querySelector(".predict-spinner");

  const demo = {
    valComp: "48.62",
    valTensile: "3.85",
    valFlex: "5.87",
    valAbs: "2.87",
    valSorp: "0.072",
    valLoss: "13.65",
    valRet: "86.35",
  };

  btn.addEventListener("click", function () {
    // Loading state
    btn.disabled = true;
    textEl.hidden = true;
    spinEl.hidden = false;

    setTimeout(function () {
      // Apply demo predictions
      Object.keys(demo).forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.textContent = demo[id];
      });


      // Reset button
      btn.disabled = false;
      textEl.hidden = false;
      spinEl.hidden = true;
    }, 900);
  });
}

/* -------------------- VALIDATION -------------------- */
function initValidation() {
  const inputs = document.querySelectorAll('input[type="number"][min][max]');
  inputs.forEach(input => {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-msg';
    errorEl.hidden = true;
    
    if (input.parentElement.classList.contains('input-affix')) {
      input.parentElement.insertAdjacentElement('afterend', errorEl);
    } else {
      input.insertAdjacentElement('afterend', errorEl);
    }

    input.addEventListener('input', function() {
      if (input.value === "") {
        errorEl.hidden = true;
        input.classList.remove('input-error');
        return;
      }
      
      const val = parseFloat(input.value);
      const min = parseFloat(input.getAttribute('min'));
      const max = parseFloat(input.getAttribute('max'));
      
      if (val < min) {
        errorEl.innerHTML = `<i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> Caution: Value is below minimum (${min} - ${max})`;
        errorEl.hidden = false;
        input.classList.add('input-error');
        if (window.lucide) lucide.createIcons();
      } else if (val > max) {
        errorEl.innerHTML = `<i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> Caution: Value is above maximum (${min} - ${max})`;
        errorEl.hidden = false;
        input.classList.add('input-error');
        if (window.lucide) lucide.createIcons();
      } else {
        errorEl.hidden = true;
        input.classList.remove('input-error');
      }
    });
  });
}


/* -------------------- MODALS -------------------- */
function initModals() {
  const howTo = document.getElementById("howToUseModal");
  const about = document.getElementById("aboutProjectModal");

  const open = (modal) => (e) => {
    e.preventDefault();
    modal.hidden = false;
  };
  const close = (modal) => () => (modal.hidden = true);

  const howBtn = document.getElementById("howToUseBtn");
  const aboutBtn = document.getElementById("aboutProjectBtn");
  if (howBtn) howBtn.addEventListener("click", open(howTo));
  if (aboutBtn) aboutBtn.addEventListener("click", open(about));

  [howTo, about].forEach(function (modal) {
    if (!modal) return;
    modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close(modal)));
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.hidden = true;
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (howTo) howTo.hidden = true;
      if (about) about.hidden = true;
    }
  });
}

/* -------------------- MOBILE MENU -------------------- */
function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;

  btn.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });

  // Close on nav click (mobile)
  sidebar.querySelectorAll(".nav-item").forEach((item) =>
    item.addEventListener("click", () => sidebar.classList.remove("open"))
  );
}


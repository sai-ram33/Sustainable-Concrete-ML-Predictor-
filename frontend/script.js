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
          data: [0, 0, 0, 0],
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
          data: [0, 0, 0, 0],
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
          data: [0, 0, 0, 0],
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
  const ageEl = document.getElementById("age");

  const demos = {
    "3 Days": { valComp: "24.10", valTensile: "3.22", valFlex: "3.22", valAbs: "3.45", valSorp: "0.095", valLoss: "15.20", valRet: "84.80" },
    "7 Days": { valComp: "31.65", valTensile: "4.12", valFlex: "4.12", valAbs: "3.12", valSorp: "0.088", valLoss: "14.50", valRet: "85.50" },
    "28 Days": { valComp: "48.62", valTensile: "3.85", valFlex: "5.87", valAbs: "2.87", valSorp: "0.072", valLoss: "13.65", valRet: "86.35" },
    "90 Days": { valComp: "62.31", valTensile: "4.92", valFlex: "7.23", valAbs: "2.55", valSorp: "0.061", valLoss: "12.10", valRet: "87.90" }
  };

  const applyDemo = (selectedAge) => {
    // Update age labels
    document.querySelectorAll(".age-display").forEach(function(el) {
      el.textContent = "at " + selectedAge;
    });

    // Update metric values
    const currentDemo = demos[selectedAge] || demos["28 Days"];
    Object.keys(currentDemo).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = currentDemo[id];
    });

    // Update chart
    if (window.strengthChart) {
      const order = ["3 Days", "7 Days", "28 Days", "90 Days"];
      const compData = order.map(age => parseFloat(demos[age].valComp));
      const tensileData = order.map(age => parseFloat(demos[age].valTensile));
      const flexData = order.map(age => parseFloat(demos[age].valFlex));

      strengthChart.data.datasets[0].data = compData;
      strengthChart.data.datasets[1].data = tensileData;
      strengthChart.data.datasets[2].data = flexData;
      strengthChart.update();
    }
  };

  btn.addEventListener("click", function () {
    // Loading state
    btn.disabled = true;
    textEl.hidden = true;
    spinEl.hidden = false;

    setTimeout(function () {
      applyDemo(ageEl ? ageEl.value : "28 Days");

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
      
      if (val < min || val > max) {
        const condition = val < min ? 'below minimum' : 'above maximum';
        errorEl.innerHTML = `<i data-lucide="alert-circle" style="width: 14px; height: 14px;"></i> Caution: Value is ${condition} (${min} - ${max})`;
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
  const open = (modal) => (e) => {
    e.preventDefault();
    if (modal) modal.hidden = false;
  };
  const close = (modal) => () => { if (modal) modal.hidden = true; };

  const howBtn = document.getElementById("howToUseBtn");
  if (howBtn) howBtn.addEventListener("click", open(howTo));

  if (howTo) {
    howTo.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close(howTo)));
    howTo.addEventListener("click", function (e) {
      if (e.target === howTo) howTo.hidden = true;
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && howTo) {
      howTo.hidden = true;
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


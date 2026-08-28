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

  btn.addEventListener("click", async function () {
    // Loading state
    btn.disabled = true;
    textEl.hidden = true;
    spinEl.hidden = false;

    // Reset values in case the backend fails
    document.getElementById("valComp").textContent = "-";
    document.getElementById("valTensile").textContent = "-";
    document.getElementById("valFlex").textContent = "-";
    document.getElementById("valAbs").textContent = "-";
    document.getElementById("valSorp").textContent = "-";
    document.getElementById("valLoss").textContent = "-";
    document.getElementById("valRet").textContent = "-";
    if (window.strengthChart) {
      strengthChart.data.datasets.forEach(ds => ds.data = [0, 0, 0, 0]);
      strengthChart.update();
    }

    // Gather input values
    const payload = {
      Cement_kg_m3: document.getElementById("cement").value || 0,
      Water_kg_m3: document.getElementById("water").value || 0,
      Fine_Aggregate_Sand_kg_m3: document.getElementById("fineAgg").value || 0,
      Coarse_Aggregate_kg_m3: document.getElementById("coarseAgg").value || 0,
      FlyAsh_pct: document.getElementById("flyAsh").value || 0,
      GGBS_pct: document.getElementById("ggbs").value || 0,
      SilicaFume_pct: document.getElementById("silica").value || 0,
      RHA_pct: document.getElementById("rha").value || 0,
      Water_Binder_Ratio: document.getElementById("wbr").value || 0,
      Curing_Age_days: parseInt((ageEl.value || "28").replace(" Days", "")),
      Curing_Condition: document.getElementById("curing").value,
      acid_attack: true,
      Acid_Type: document.getElementById("acidType").value,
      Acid_Concentration_pct: document.getElementById("acidConcentration").value,
      Acid_Exposure_Duration_days: document.getElementById("acidDuration").value,
      Acid_Exposure_Condition: document.getElementById("acidExposure").value
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.result) {
        // Update age labels
        document.querySelectorAll(".age-display").forEach(function(el) {
          el.textContent = "at " + ageEl.value;
        });

        // Update metric values
        const res = data.result;
        document.getElementById("valComp").textContent = res.CompressiveStrength_MPa.toFixed(2);
        document.getElementById("valTensile").textContent = res.SplitTensileStrength_MPa.toFixed(2);
        document.getElementById("valFlex").textContent = res.FlexuralStrength_MPa.toFixed(2);
        document.getElementById("valAbs").textContent = res.WaterAbsorption_pct.toFixed(2);
        document.getElementById("valSorp").textContent = res.Sorptivity_mm_per_sqrt_s.toFixed(3);
        document.getElementById("valLoss").textContent = res.AcidStrengthLoss_pct.toFixed(2);
        document.getElementById("valRet").textContent = res.AcidStrengthRetention_pct.toFixed(2);

        // Update chart
        if (window.strengthChart && data.chart) {
          strengthChart.data.datasets[0].data = data.chart.compressive;
          strengthChart.data.datasets[1].data = data.chart.split;
          strengthChart.data.datasets[2].data = data.chart.flexural;
          strengthChart.update();
        }
      }
    } catch (err) {
      console.error("Error making prediction:", err);
      alert("Failed to connect to the backend prediction API.");
    } finally {
      // Reset button
      btn.disabled = false;
      textEl.hidden = false;
      spinEl.hidden = true;
    }
  });
}

/* -------------------- VALIDATION -------------------- */
function initValidation() {
  // Prevent scroll wheel from changing number input values
  const allNumberInputs = document.querySelectorAll('input[type="number"]');
  allNumberInputs.forEach(input => {
    input.addEventListener('wheel', function(e) {
      e.preventDefault();
    }, { passive: false });
  });

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


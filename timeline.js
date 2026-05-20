import { PROMO_DATA } from './data.js';

// --- DOM References ---
const DOM = {
  marketAnalysisText: document.getElementById('market-analysis-text'),
  chartContainer: document.getElementById('chart-container'),
  timelineOpFilter: document.getElementById('timeline-op-filter'),
  timelineFeedContainer: document.getElementById('timeline-feed-container')
};

// --- Initialization ---
function init() {
  renderMarketSummary();
  populateOpFilter();
  renderTimelineFeed('all');
  renderSvgChart();

  // Listen for filter changes on the timeline feed
  DOM.timelineOpFilter.addEventListener('change', (e) => {
    renderTimelineFeed(e.target.value);
  });

  // Re-draw chart when the historical trends tab is opened
  // This avoids zero-width bounding box issues when index.html renders hidden elements.
  window.addEventListener('tab-changed', (e) => {
    if (e.detail === 'timeline') {
      // Re-draw the chart to ensure layout fits the visible container
      renderSvgChart();
    }
  });
}

// --- Render Market Analysis Summary ---
function renderMarketSummary() {
  if (DOM.marketAnalysisText) {
    DOM.marketAnalysisText.textContent = PROMO_DATA.marketAnalysis.summary;
  }
}

// --- Populate Brand Focus Selector ---
function populateOpFilter() {
  DOM.timelineOpFilter.innerHTML = '<option value="all">All Brands</option>';
  
  PROMO_DATA.operators.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.id;
    opt.textContent = op.name;
    DOM.timelineOpFilter.appendChild(opt);
  });
}

// --- Render SVG Trend Chart ---
function renderSvgChart() {
  const container = DOM.chartContainer;
  container.innerHTML = ''; // Clear previous

  const trends = PROMO_DATA.marketAnalysis.trends;
  
  // Define SVG dimensions
  const width = 560;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  // Find min/max values for scaling
  const years = trends.map(t => t.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  const values = trends.map(t => t.averageValue);
  const maxVal = 40; // Hardcode bounds for a cleaner look
  const minVal = 10;

  // Coordinate Mapping Helpers
  const mapX = (year) => {
    const ratio = (year - minYear) / (maxYear - minYear);
    return paddingLeft + ratio * (width - paddingLeft - paddingRight);
  };

  const mapY = (val) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    // SVG coordinates start at top left, so we invert Y
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  // Build grid lines and labels
  let gridLinesHtml = '';
  const gridSteps = 4; // 10, 20, 30, 40
  for (let i = 0; i <= gridSteps; i++) {
    const gridVal = minVal + i * ((maxVal - minVal) / gridSteps);
    const y = mapY(gridVal);
    gridLinesHtml += `
      <!-- Grid line -->
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid-line" />
      <!-- Y-Axis Label -->
      <text x="${paddingLeft - 10}" y="${y + 3}" class="chart-axis-text" text-anchor="end">£${gridVal}</text>
    `;
  }

  // Draw X Axis labels
  let xAxisHtml = '';
  trends.forEach(t => {
    const x = mapX(t.year);
    xAxisHtml += `
      <text x="${x}" y="${height - 10}" class="chart-axis-text" text-anchor="middle">${t.year}</text>
    `;
  });

  // Calculate coordinates for line and area path
  const points = trends.map(t => ({
    x: mapX(t.year),
    y: mapY(t.averageValue),
    val: t.averageValue,
    year: t.year,
    pressure: t.regPressure,
    desc: t.description
  }));

  // Build the SVG path strings
  let linePathD = `M ${points[0].x} ${points[0].y}`;
  let areaPathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    linePathD += ` L ${points[i].x} ${points[i].y}`;
    areaPathD += ` L ${points[i].x} ${points[i].y}`;
  }

  // Close the area path down to the baseline
  const baseY = height - paddingBottom;
  areaPathD += ` L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

  // Build HTML nodes for datapoint circles
  let nodesHtml = '';
  points.forEach((p, idx) => {
    nodesHtml += `
      <circle 
        cx="${p.x}" 
        cy="${p.y}" 
        r="6" 
        class="chart-node" 
        data-index="${idx}"
        style="--primary: #00f2fe; --bg-dark: #080b11;"
      />
    `;
  });

  // Assemble full SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "chart-svg");
  
  svg.innerHTML = `
    <defs>
      <!-- Line Gradient -->
      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f2fe" />
        <stop offset="50%" stop-color="#05d5a1" />
        <stop offset="100%" stop-color="#fbc02d" />
      </linearGradient>
      
      <!-- Area Gradient -->
      <linearGradient id="chartAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#00f2fe" stop-opacity="0.0" />
      </linearGradient>
    </defs>
    
    <!-- Grid -->
    ${gridLinesHtml}
    
    <!-- X Axis Years -->
    ${xAxisHtml}
    
    <!-- Area Under Line -->
    <path d="${areaPathD}" class="chart-area" />
    
    <!-- Trend Line -->
    <path d="${linePathD}" class="chart-line" />
    
    <!-- Interactive Circles -->
    ${nodesHtml}
  `;

  container.appendChild(svg);

  // Setup dynamic chart tooltips
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  container.appendChild(tooltip);

  const circles = svg.querySelectorAll('.chart-node');
  circles.forEach(circle => {
    circle.addEventListener('mouseenter', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const pt = points[idx];

      tooltip.innerHTML = `
        <div style="font-weight: 700; color: var(--primary); margin-bottom: 2px;">Year: ${pt.year}</div>
        <div style="font-size: 13px; font-weight: 800; margin-bottom: 4px;">Avg Bonus: £${pt.val.toFixed(2)}</div>
        <div style="color: var(--text-muted); font-size: 10px; margin-bottom: 4px;">Regulation: <span style="color: ${pt.pressure === 'Low' ? 'var(--secondary)' : pt.pressure === 'Medium' ? 'var(--accent-gold)' : 'var(--danger)'}; font-weight: 700">${pt.pressure}</span></div>
        <div style="max-width: 180px; font-size: 10px; line-height: 1.3; color: var(--text-dim); border-top: 1px solid var(--card-border); padding-top: 4px;">${pt.desc}</div>
      `;

      // Position tooltip relative to container
      const rect = e.target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const left = rect.left - containerRect.left + rect.width / 2;
      const top = rect.top - containerRect.top;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.opacity = '1';
    });

    circle.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });
}

// --- Render Operator Timeline Feed ---
function renderTimelineFeed(operatorId) {
  DOM.timelineFeedContainer.innerHTML = '';

  let events = [];

  // Compile and flatten historical offers
  PROMO_DATA.operators.forEach(op => {
    if (operatorId !== 'all' && op.id !== operatorId) return;

    op.historicalOffers.forEach(hist => {
      events.push({
        opId: op.id,
        opName: op.name,
        opColor: op.themeColor,
        year: hist.year,
        bonusAmount: hist.bonusAmount,
        minStake: hist.minStake,
        title: hist.title,
        notes: hist.notes || getDefaultNote(op.name, hist.year, hist.bonusAmount, hist.minStake)
      });
    });
  });

  // Sort events by year descending, then by operator name
  events.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return a.opName.localeCompare(b.opName);
  });

  if (events.length === 0) {
    DOM.timelineFeedContainer.innerHTML = '<p class="section-desc">No history items found.</p>';
    return;
  }

  // Draw timeline items
  events.forEach(ev => {
    const node = document.createElement('div');
    node.className = 'timeline-node animate-in';
    node.style.setProperty('--op-color', ev.opColor);

    node.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-header-row">
        <span class="timeline-year">${ev.year}</span>
        <span class="timeline-brand-name">${ev.opName}</span>
      </div>
      <div class="timeline-offer-title">${ev.title}</div>
      <p class="timeline-note">${ev.notes}</p>
    `;

    DOM.timelineFeedContainer.appendChild(node);
  });
}

// --- Helper to supply default notes if missing ---
function getDefaultNote(opName, year, bonus, stake) {
  if (year === 2026) {
    return `${opName} stabilized its acquisition budget. The £${bonus} package caters to UK GC regulatory changes.`;
  }
  if (year === 2025) {
    if (opName === 'Coral' || opName === 'Ladbrokes') {
      return `Adjusted offers downwards to £20 following compliance audit and focus on casual Bet Builder structures.`;
    }
    return `${opName} refined signup conditions, maintaining a £${bonus} free bet pool while adjusting restrictions.`;
  }
  if (year === 2022) {
    if (opName === 'bet365') {
      return `Offered a market-leading £50 in free bets for low entry barrier (£10) prior to subsequent compliance limits.`;
    }
    return `Standard £${bonus} sign-up package launched during aggressive post-pandemic user acquisition cycles.`;
  }
  return `Offered a package of £${bonus} free bets requiring a qualifying bet of £${stake}.`;
}

// --- Initialize Execution ---
document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  init();
}

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
  renderSvgChart('all');

  // Listen for filter changes on both timeline feed and chart
  DOM.timelineOpFilter.addEventListener('change', (e) => {
    const val = e.target.value;
    renderTimelineFeed(val);
    renderSvgChart(val);
  });

  // Re-draw chart when the historical trends tab is opened
  window.addEventListener('tab-changed', (e) => {
    if (e.detail === 'timeline') {
      renderSvgChart(DOM.timelineOpFilter.value);
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
  DOM.timelineOpFilter.innerHTML = '<option value="all">All Brands (Averages)</option>';
  
  PROMO_DATA.operators.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.id;
    opt.textContent = op.name;
    DOM.timelineOpFilter.appendChild(opt);
  });
}

// --- Compile Historical Comparison Data Series ---
function getHistoricalDataSeries(operatorId) {
  const years = [2022, 2023, 2024, 2025, 2026];
  
  if (operatorId === 'all') {
    return years.map(year => {
      let totalBonus = 0;
      let totalStake = 0;
      let count = 0;
      
      PROMO_DATA.operators.forEach(op => {
        const hist = op.historicalOffers.find(h => h.year === year);
        if (hist) {
          totalBonus += hist.bonusAmount;
          totalStake += hist.minStake;
          count++;
        }
      });
      
      const avgBonus = count > 0 ? totalBonus / count : 0;
      const avgStake = count > 0 ? totalStake / count : 0;
      const avgProfit = avgBonus * 0.70;
      
      return {
        year,
        bonus: avgBonus,
        stake: avgStake,
        profit: avgProfit,
        description: `Average stats across all ${count} tracked operators.`
      };
    });
  } else {
    const op = PROMO_DATA.operators.find(o => o.id === operatorId);
    if (!op) return [];
    
    return years.map(year => {
      const hist = op.historicalOffers.find(h => h.year === year);
      if (hist) {
        return {
          year,
          bonus: hist.bonusAmount,
          stake: hist.minStake,
          profit: hist.bonusAmount * 0.70,
          description: hist.title || `${op.name} Welcome Offer`
        };
      }
      return { year, bonus: 0, stake: 0, profit: 0, description: 'No historical campaign data' };
    });
  }
}

// --- Render SVG Trend Chart ---
function renderSvgChart(operatorId = 'all') {
  const container = DOM.chartContainer;
  container.innerHTML = ''; // Clear previous

  const dataSeries = getHistoricalDataSeries(operatorId);
  if (dataSeries.length === 0) return;

  // Define SVG dimensions
  const width = 560;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  // Grid bounds: 0 to 60 for absolute comparison of stakes vs bonuses
  const minVal = 0;
  const maxVal = 60;

  const years = dataSeries.map(d => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Coordinate Mapping Helpers
  const mapX = (year) => {
    const ratio = (year - minYear) / (maxYear - minYear);
    return paddingLeft + ratio * (width - paddingLeft - paddingRight);
  };

  const mapY = (val) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  // Build grid lines and labels
  let gridLinesHtml = '';
  const gridSteps = 4; // 0, 15, 30, 45, 60
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
  dataSeries.forEach(t => {
    const x = mapX(t.year);
    xAxisHtml += `
      <text x="${x}" y="${height - 10}" class="chart-axis-text" text-anchor="middle">${t.year}</text>
    `;
  });

  // Compile points for each line
  const bonusPoints = dataSeries.map(d => ({ x: mapX(d.year), y: mapY(d.bonus) }));
  const stakePoints = dataSeries.map(d => ({ x: mapX(d.year), y: mapY(d.stake) }));
  const profitPoints = dataSeries.map(d => ({ x: mapX(d.year), y: mapY(d.profit) }));

  // Helper to build SVG path definitions
  const buildPathD = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  };

  const buildAreaD = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    const baseY = height - paddingBottom;
    d += ` L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
    return d;
  };

  const bonusPathD = buildPathD(bonusPoints);
  const stakePathD = buildPathD(stakePoints);
  const profitPathD = buildPathD(profitPoints);
  const profitAreaD = buildAreaD(profitPoints);

  // Build Interactive Circles
  let nodesHtml = '';
  dataSeries.forEach(d => {
    const cx = mapX(d.year);
    // Render distinct hover node circles for each coordinate
    nodesHtml += `
      <!-- Year Hover Zone Circle -->
      <circle cx="${cx}" cy="${mapY(d.bonus)}" r="5" class="chart-node" data-year="${d.year}" style="--primary: #00f2fe; --bg-dark: #080b11; stroke: #00f2fe; stroke-width: 2px;" />
      <circle cx="${cx}" cy="${mapY(d.stake)}" r="5" class="chart-node" data-year="${d.year}" style="--primary: #ff7043; --bg-dark: #080b11; stroke: #ff7043; stroke-width: 2px;" />
      <circle cx="${cx}" cy="${mapY(d.profit)}" r="5" class="chart-node" data-year="${d.year}" style="--primary: #05d5a1; --bg-dark: #080b11; stroke: #05d5a1; stroke-width: 2px;" />
    `;
  });

  // Setup Dynamic Legend Headers
  const brandName = operatorId === 'all' ? 'All Brands (Average)' : PROMO_DATA.operators.find(o => o.id === operatorId).name;
  const legendHtml = `
    <div class="chart-legend-container" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; padding: 0 10px;">
      <h3 style="font-size: 13px; font-weight: 800; margin: 0; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid var(--primary); padding-left: 8px;">${brandName}</h3>
      <div style="display: flex; gap: 15px; font-size: 11px; font-weight: 700;">
        <span style="display: flex; align-items: center; gap: 6px; color: var(--text-light);">
          <span style="width: 10px; height: 3px; background: #00f2fe; border-radius: 1px;"></span> Welcome Bonus
        </span>
        <span style="display: flex; align-items: center; gap: 6px; color: var(--text-light);">
          <span style="width: 10px; height: 3px; background: #ff7043; border-radius: 1px;"></span> Min Stake
        </span>
        <span style="display: flex; align-items: center; gap: 6px; color: var(--text-light);">
          <span style="width: 10px; height: 3px; background: #05d5a1; border-radius: 1px;"></span> Expected Profit
        </span>
      </div>
    </div>
  `;

  // Assemble full SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("class", "chart-svg");
  
  svg.innerHTML = `
    <defs>
      <!-- Area Gradient -->
      <linearGradient id="profitAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#05d5a1" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#05d5a1" stop-opacity="0.0" />
      </linearGradient>
    </defs>
    
    <!-- Grid -->
    ${gridLinesHtml}
    
    <!-- X Axis Years -->
    ${xAxisHtml}
    
    <!-- Area Under Profit Line -->
    <path d="${profitAreaD}" fill="url(#profitAreaGrad)" />
    
    <!-- Line Paths -->
    <path d="${bonusPathD}" fill="none" stroke="#00f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,242,254,0.25));" />
    <path d="${stakePathD}" fill="none" stroke="#ff7043" stroke-width="2.5" stroke-dasharray="4 3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(255,112,67,0.2));" />
    <path d="${profitPathD}" fill="none" stroke="#05d5a1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(5,213,161,0.25));" />
    
    <!-- Interactive Circles -->
    ${nodesHtml}
  `;

  const legendDiv = document.createElement('div');
  legendDiv.innerHTML = legendHtml;
  container.appendChild(legendDiv);
  container.appendChild(svg);

  // Setup dynamic chart tooltips
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  container.appendChild(tooltip);

  const circles = svg.querySelectorAll('.chart-node');
  circles.forEach(circle => {
    circle.addEventListener('mouseenter', (e) => {
      const year = parseInt(e.target.dataset.year, 10);
      const pt = dataSeries.find(d => d.year === year);
      if (!pt) return;

      // Expand all nodes for this year on hover
      svg.querySelectorAll(`.chart-node[data-year="${year}"]`).forEach(node => {
        node.setAttribute('r', '7');
      });

      tooltip.innerHTML = `
        <div style="font-weight: 700; color: var(--text-light); margin-bottom: 6px; font-size: 11px; border-bottom: 1px solid var(--card-border); padding-bottom: 4px;">Year: ${pt.year}</div>
        <div style="display: flex; justify-content: space-between; gap: 15px; font-size: 11px; margin-bottom: 3px; font-weight: 600;">
          <span style="color: #00f2fe;">● Welcome Bonus:</span>
          <span style="color: var(--text-light)">£${pt.bonus.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 15px; font-size: 11px; margin-bottom: 3px; font-weight: 600;">
          <span style="color: #ff7043;">● Min Stake:</span>
          <span style="color: var(--text-light)">£${pt.stake.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 15px; font-size: 11px; margin-bottom: 6px; font-weight: 600;">
          <span style="color: #05d5a1;">● Expected Profit:</span>
          <span style="color: var(--text-light)">£${pt.profit.toFixed(2)}</span>
        </div>
        <div style="max-width: 200px; font-size: 10px; line-height: 1.35; color: var(--text-muted); border-top: 1px dashed var(--card-border); padding-top: 5px;">
          ${pt.description}
        </div>
      `;

      // Position tooltip relative to container
      const rect = e.target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const left = rect.left - containerRect.left + rect.width / 2;
      const top = rect.top - containerRect.top - 15;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.opacity = '1';
    });

    circle.addEventListener('mouseleave', (e) => {
      const year = parseInt(e.target.dataset.year, 10);
      svg.querySelectorAll(`.chart-node[data-year="${year}"]`).forEach(node => {
        node.setAttribute('r', '5');
      });
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

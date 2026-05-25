import { PROMO_DATA } from './data.js';

// (Active operator filtering is decoupled and applied locally in UI/Calculator views to preserve historical database in memory)
// --- Application State ---
const state = {
  searchQuery: '',
  selectedOperators: [],
  selectedOfferTypes: [],
  minBonus: 0,
  maxStake: 20,
  sortBy: 'rating',
  activeTab: 'offers',
  currentPage: 1,
  itemsPerPage: 12
};

// --- DOM References ---
const DOM = {
  offersContainer: document.getElementById('offers-container'),
  resultsCount: document.getElementById('results-count'),
  searchInput: document.getElementById('search-input'),
  operatorCheckboxesContainer: document.getElementById('operator-checkboxes'),
  offerTypeCheckboxesContainer: document.getElementById('offer-type-checkboxes'),
  minBonusRange: document.getElementById('min-bonus-range'),
  minBonusLabel: document.getElementById('min-bonus-label'),
  maxStakeRange: document.getElementById('max-stake-range'),
  maxStakeLabel: document.getElementById('max-stake-label'),
  sortSelect: document.getElementById('sort-select'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  
  // Calculator
  budgetInput: document.getElementById('budget-input'),
  calcOddsSelect: document.getElementById('calc-odds'),
  calcTotalSpend: document.getElementById('calc-total-spend'),
  calcTotalBonus: document.getElementById('calc-total-bonus'),
  calcEligibleCount: document.getElementById('calc-eligible-count'),
  calcEvEstimate: document.getElementById('calc-ev-estimate'),
  calcRecommendations: document.getElementById('calc-recommendations'),
  
  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  offersView: document.getElementById('offers-view'),
  calculatorView: document.getElementById('calculator-view'),
  timelineView: document.getElementById('timeline-view'),
  
  // Modal
  termsModal: document.getElementById('terms-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalOpLogo: document.getElementById('modal-operator-logo'),
  modalOpName: document.getElementById('modal-operator-name'),
  modalOfferTitle: document.getElementById('modal-offer-title'),
  modalStatBonus: document.getElementById('modal-stat-bonus'),
  modalStatStake: document.getElementById('modal-stat-stake'),
  modalStatOdds: document.getElementById('modal-stat-odds'),
  modalStatExpiry: document.getElementById('modal-stat-expiry'),
  modalStatBonusBox: document.getElementById('modal-stat-bonus-box'),
  modalStatOddsBox: document.getElementById('modal-stat-odds-box'),
  modalStepsList: document.getElementById('modal-steps-list'),
  modalExclusionsList: document.getElementById('modal-exclusions-list'),
  modalTermsText: document.getElementById('modal-terms-text'),
  modalPromoCode: document.getElementById('modal-promo-code'),
  modalCopyBtn: document.getElementById('modal-copy-btn'),
  modalVisitBtn: document.getElementById('modal-visit-btn')
};

// --- Initialize App ---
function init() {
  populateFilters();
  setupEventListeners();
  renderOffers();
  calculateBudgetPotential();
  
  // Set default values for sliders
  DOM.minBonusLabel.textContent = `£${DOM.minBonusRange.value}`;
  DOM.maxStakeLabel.textContent = `£${DOM.maxStakeRange.value}`;
}

// --- Populate Filter Checkboxes ---
function populateFilters() {
  DOM.operatorCheckboxesContainer.innerHTML = '';
  
  // Only display filter checkboxes for active/scraped operators
  const activeOps = PROMO_DATA.operators.filter(op => op.currentOffer.bonusAmount > 0 && !op.currentOffer.title.includes("No Live Data Found"));
  
  activeOps.forEach(op => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = op.id;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.selectedOperators.push(op.id);
      } else {
        state.selectedOperators = state.selectedOperators.filter(id => id !== op.id);
      }
      state.currentPage = 1;
      renderOffers();
    });
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${op.name}`));
    DOM.operatorCheckboxesContainer.appendChild(label);
  });

  // Populate offer types checkboxes
  DOM.offerTypeCheckboxesContainer.innerHTML = '';
  
  const OFFER_TYPES = {
    'free-bet': 'Free Bets',
    'free-spins-no-deposit': 'Free Spins',
    'bingo': 'Bingo Bonuses'
  };
  
  Object.entries(OFFER_TYPES).forEach(([typeVal, typeLabel]) => {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = typeVal;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.selectedOfferTypes.push(typeVal);
      } else {
        state.selectedOfferTypes = state.selectedOfferTypes.filter(val => val !== typeVal);
      }
      state.currentPage = 1;
      renderOffers();
    });
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${typeLabel}`));
    DOM.offerTypeCheckboxesContainer.appendChild(label);
  });
}

// --- Set Up Event Listeners ---
function setupEventListeners() {
  // Mobile Filter Accordion Toggle
  const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
  const filterContent = document.getElementById('filter-content');
  if (mobileFilterToggle && filterContent) {
    mobileFilterToggle.addEventListener('click', () => {
      mobileFilterToggle.classList.toggle('open');
      filterContent.classList.toggle('open');
    });
  }

  // Search input
  DOM.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    state.currentPage = 1;
    renderOffers();
  });

  // Range Sliders
  DOM.minBonusRange.addEventListener('input', (e) => {
    state.minBonus = parseInt(e.target.value, 10);
    DOM.minBonusLabel.textContent = `£${state.minBonus}`;
    state.currentPage = 1;
    renderOffers();
  });

  DOM.maxStakeRange.addEventListener('input', (e) => {
    state.maxStake = parseInt(e.target.value, 10);
    DOM.maxStakeLabel.textContent = `£${state.maxStake}`;
    state.currentPage = 1;
    renderOffers();
  });

  // Sort Select
  DOM.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    state.currentPage = 1;
    renderOffers();
  });

  // Reset Filters Button
  DOM.resetFiltersBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.selectedOperators = [];
    state.selectedOfferTypes = [];
    state.minBonus = 0;
    state.maxStake = 20;
    state.sortBy = 'rating';
    state.currentPage = 1;
    
    DOM.searchInput.value = '';
    DOM.minBonusRange.value = 0;
    DOM.minBonusLabel.textContent = '£0';
    DOM.maxStakeRange.value = 20;
    DOM.maxStakeLabel.textContent = '£20';
    DOM.sortSelect.value = 'rating';
    
    // Uncheck checkboxes in both lists
    const checkboxes = document.querySelectorAll('.checkbox-list input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    renderOffers();
  });

  // Calculator Inputs
  DOM.budgetInput.addEventListener('input', calculateBudgetPotential);
  DOM.calcOddsSelect.addEventListener('change', calculateBudgetPotential);

  // Tab switching
  DOM.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const tab = btn.dataset.tab;
      state.activeTab = tab;
      
      const sidebar = document.querySelector('.sidebar-panel');
      const mainLayout = document.querySelector('.main-layout');
      
      if (tab === 'offers') {
        DOM.offersView.classList.add('active');
        DOM.calculatorView.classList.remove('active');
        DOM.timelineView.classList.remove('active');
        if (sidebar) sidebar.style.display = '';
        if (mainLayout) mainLayout.classList.remove('full-width-layout');
      } else if (tab === 'calculator') {
        DOM.offersView.classList.remove('active');
        DOM.calculatorView.classList.add('active');
        DOM.timelineView.classList.remove('active');
        if (sidebar) sidebar.style.display = 'none';
        if (mainLayout) mainLayout.classList.add('full-width-layout');
      } else if (tab === 'timeline') {
        DOM.offersView.classList.remove('active');
        DOM.calculatorView.classList.remove('active');
        DOM.timelineView.classList.add('active');
        if (sidebar) sidebar.style.display = 'none';
        if (mainLayout) mainLayout.classList.add('full-width-layout');
        // Notify timeline module that it is visible (useful for drawing the SVG)
        window.dispatchEvent(new CustomEvent('tab-changed', { detail: 'timeline' }));
      }
    });
  });

  // Modal Closing
  DOM.modalCloseBtn.addEventListener('click', closeModal);
  DOM.termsModal.addEventListener('click', (e) => {
    if (e.target === DOM.termsModal) closeModal();
  });
  
  // Clipboard Copy button
  DOM.modalCopyBtn.addEventListener('click', copyPromoCode);
}

// --- Render Offers Grid ---
function renderOffers() {
  DOM.offersContainer.innerHTML = '';
  
  // Filter active operators
  const activeOps = PROMO_DATA.operators.filter(op => op.currentOffer.bonusAmount > 0 && !op.currentOffer.title.includes("No Live Data Found"));
  
  let filtered = activeOps.filter(op => {
    const offer = op.currentOffer;
    
    // Operator selection filter
    if (state.selectedOperators.length > 0 && !state.selectedOperators.includes(op.id)) {
      return false;
    }
    
    // Offer type selection filter
    if (state.selectedOfferTypes.length > 0 && !state.selectedOfferTypes.includes(offer.type)) {
      return false;
    }
    
    // Search query filter
    if (state.searchQuery) {
      const matchName = op.name.toLowerCase().includes(state.searchQuery);
      const matchTitle = offer.title.toLowerCase().includes(state.searchQuery);
      const matchPromo = offer.promoCode.toLowerCase().includes(state.searchQuery);
      if (!matchName && !matchTitle && !matchPromo) return false;
    }
    
    // Bonus amount slider filter
    if (offer.bonusAmount < state.minBonus) return false;
    
    // Qualifying stake slider filter
    if (offer.minStake > state.maxStake) return false;
    
    return true;
  });

  // Sorting logic
  filtered.sort((a, b) => {
    const offA = a.currentOffer;
    const offB = b.currentOffer;
    
    if (state.sortBy === 'rating') {
      return b.currentOffer.rating - a.currentOffer.rating;
    } else if (state.sortBy === 'bonus-high') {
      return offB.bonusAmount - offA.bonusAmount;
    } else if (state.sortBy === 'stake-low') {
      return offA.minStake - offB.minStake;
    } else if (state.sortBy === 'odds-low') {
      return offA.minOdds - offB.minOdds;
    }
    return 0;
  });

  DOM.resultsCount.textContent = filtered.length;

  if (filtered.length === 0) {
    DOM.offersContainer.innerHTML = `
      <div class="glass-card no-results">
        <p>No offers match your current filter settings.</p>
        <button id="no-results-reset" class="btn btn-primary" style="margin-top: 15px; width: auto;">Reset Filters</button>
      </div>
    `;
    document.getElementById('no-results-reset')?.addEventListener('click', () => {
      DOM.resetFiltersBtn.click();
    });
    return;
  }

  // Pagination logic
  const totalOffers = filtered.length;
  const totalPages = Math.ceil(totalOffers / state.itemsPerPage);
  
  if (state.currentPage > totalPages && totalPages > 0) {
    state.currentPage = totalPages;
  }
  
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const pageOffers = filtered.slice(startIndex, startIndex + state.itemsPerPage);

  // Draw cards
  pageOffers.forEach(op => {
    const offer = op.currentOffer;
    
    // Generate card element
    const card = document.createElement('article');
    card.className = 'glass-card offer-card';
    card.style.setProperty('--op-theme', op.themeColor);
    
    const statsGridHtml = `
      <div class="card-stats-grid single-stat">
        <div class="stat-item">
          <span class="stat-label">Min Stake</span>
          <span class="stat-value">£${offer.minStake.toFixed(2)}</span>
        </div>
      </div>
    `;
    
    card.innerHTML = `
      <div class="badge-offer-type">${offer.bonusType}</div>
      <div class="card-top">
        <div class="operator-identity">
          <div class="logo-wrap">${op.logoSvg}</div>
          <div>
            <h3 class="op-name">${op.name}</h3>
            <div class="rating-badge">
              <svg viewBox="0 0 24 24" class="star-icon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span>${offer.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>
      </div>
      
      <h4 class="offer-title-main">${offer.title}</h4>
      
      ${statsGridHtml}
      
      <div class="card-footer-controls">
        <button class="btn btn-primary btn-details" data-op-id="${op.id}">View Details & T&Cs</button>
        <a href="${offer.url}" target="_blank" rel="noopener noreferrer" class="btn-icon-only btn-visit" title="Visit Operator Website">
          <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/></svg>
        </a>
      </div>
    `;
    
    DOM.offersContainer.appendChild(card);
  });

  // Attach card event listeners
  DOM.offersContainer.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const opId = e.currentTarget.dataset.opId;
      openModal(opId);
    });
  });

  renderPagination(totalPages);
}

// --- Render Pagination ---
function renderPagination(totalPages) {
  const container = document.getElementById('pagination-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (totalPages <= 1) return; // Hide if only 1 page
  
  const paginationWrapper = document.createElement('div');
  paginationWrapper.className = 'pagination-controls';
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-secondary btn-page';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = state.currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderOffers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationWrapper.appendChild(prevBtn);
  
  // Page info
  const info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = `Page ${state.currentPage} of ${totalPages}`;
  paginationWrapper.appendChild(info);
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-secondary btn-page';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = state.currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (state.currentPage < totalPages) {
      state.currentPage++;
      renderOffers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationWrapper.appendChild(nextBtn);
  
  container.appendChild(paginationWrapper);
}

// --- Offer Calculator Algorithms ---
function calculateBudgetPotential() {
  const budget = parseFloat(DOM.budgetInput.value) || 0;
  const targetOdds = parseFloat(DOM.calcOddsSelect.value) || 1.5;
  
  // Find all active operators whose welcome offer stake requirement is <= budget
  // and whose qualifying odds requirement is <= target qualifying odds.
  const activeOps = PROMO_DATA.operators.filter(op => op.currentOffer.bonusAmount > 0 && !op.currentOffer.title.includes("No Live Data Found"));
  
  let eligibleOperators = activeOps.filter(op => {
    const offer = op.currentOffer;
    return offer.minStake <= budget && offer.minOdds <= targetOdds;
  });

  // Sort them so that the best value comes first (highest bonus, lowest stake)
  eligibleOperators.sort((a, b) => {
    const valA = a.currentOffer.bonusAmount;
    const valB = b.currentOffer.bonusAmount;
    if (valB !== valA) return valB - valA;
    return a.currentOffer.minStake - b.currentOffer.minStake;
  });

  let cumulativeSpend = 0;
  let selectedForBudget = [];
  
  for (let op of eligibleOperators) {
    if (cumulativeSpend + op.currentOffer.minStake <= budget) {
      cumulativeSpend += op.currentOffer.minStake;
      selectedForBudget.push(op);
    }
  }
  
  eligibleOperators = selectedForBudget;

  let totalSpend = 0;
  let totalBonus = 0;
  let totalEv = 0;
  
  eligibleOperators.forEach(op => {
    const offer = op.currentOffer;
    totalSpend += offer.minStake;
    totalBonus += offer.bonusAmount;
    
    // EV retention rate: 70% for free-bet, 50% for free-spins-no-deposit and bingo
    let retention = 0.70;
    if (offer.type === 'free-spins-no-deposit') retention = 0.50;
    else if (offer.type === 'bingo') retention = 0.50;
    
    totalEv += offer.bonusAmount * retention;
  });

  // Render values
  DOM.calcTotalSpend.textContent = `£${totalSpend.toFixed(2)}`;
  DOM.calcTotalBonus.textContent = `£${totalBonus.toFixed(2)}`;
  DOM.calcEligibleCount.textContent = `${eligibleOperators.length} Operator${eligibleOperators.length === 1 ? '' : 's'}`;
  
  DOM.calcEvEstimate.textContent = `£${totalEv.toFixed(2)}`;

  // Populate Recommendations Checklist
  DOM.calcRecommendations.innerHTML = '';
  if (eligibleOperators.length === 0) {
    DOM.calcRecommendations.innerHTML = `
      <div class="calc-rec-item" style="border: 1px dashed var(--danger); background: var(--danger-glow)">
        <p style="color: var(--danger); font-weight: 500;">No offers match this budget. Try increasing budget or adjusting target odds to 1/1 (2.0) or higher.</p>
      </div>
    `;
    return;
  }

  eligibleOperators.forEach((op, index) => {
    const offer = op.currentOffer;
    const item = document.createElement('div');
    item.className = 'calc-rec-item animate-in';
    item.style.animationDelay = `${index * 0.05}s`;
    
    item.innerHTML = `
      <div class="calc-rec-bullet">${index + 1}</div>
      <div>
        <strong>Deposit & Bet £${offer.minStake.toFixed(2)} on ${op.name}</strong>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          Qualifying bet odds: ${formatOdds(offer.minOdds)}+. Reward: ${offer.bonusType} worth <span class="highlight-green" style="font-weight:700">£${offer.bonusAmount}</span>.
        </p>
      </div>
    `;
    DOM.calcRecommendations.appendChild(item);
  });
}

// --- Modal Functionality ---
function openModal(opId) {
  const op = PROMO_DATA.operators.find(o => o.id === opId);
  if (!op) return;

  const offer = op.currentOffer;

  // Set branding theme color
  DOM.termsModal.style.setProperty('--op-theme', op.themeColor);

  // Fill in content
  DOM.modalOpLogo.innerHTML = op.logoSvg;
  DOM.modalOpName.textContent = op.name;
  DOM.modalOfferTitle.textContent = offer.title;
  
  DOM.modalStatBonus.textContent = `£${offer.bonusAmount}`;
  DOM.modalStatStake.textContent = `£${offer.minStake}`;
  DOM.modalStatOdds.textContent = formatOdds(offer.minOdds);
  DOM.modalStatExpiry.textContent = `${offer.expiryDays} Days`;

  // Toggle visibility of Bonus and Odds in details modal based on type
  if (offer.type === 'free-spins-no-deposit') {
    if (DOM.modalStatBonusBox) DOM.modalStatBonusBox.style.display = 'none';
    if (DOM.modalStatOddsBox) DOM.modalStatOddsBox.style.display = 'none';
  } else if (offer.type === 'bingo') {
    if (DOM.modalStatBonusBox) DOM.modalStatBonusBox.style.display = '';
    if (DOM.modalStatOddsBox) DOM.modalStatOddsBox.style.display = 'none';
  } else { // free-bet
    if (DOM.modalStatBonusBox) DOM.modalStatBonusBox.style.display = '';
    if (DOM.modalStatOddsBox) DOM.modalStatOddsBox.style.display = '';
  }

  // Build steps list
  DOM.modalStepsList.innerHTML = '';
  const hasSteps = offer.steps && offer.steps.length > 0 && !(offer.steps.length === 1 && (!offer.steps[0] || offer.steps[0].toLowerCase() === 'none' || offer.steps[0].trim() === ''));
  if (hasSteps) {
    offer.steps.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = step;
      DOM.modalStepsList.appendChild(li);
    });
  }
  const claimSection = DOM.modalStepsList.closest('.modal-section');
  if (claimSection) {
    claimSection.style.display = hasSteps ? '' : 'none';
  }

  // Build payment exclusions list
  DOM.modalExclusionsList.innerHTML = '';
  const hasExclusions = offer.depositExclusions && offer.depositExclusions.length > 0 && !(offer.depositExclusions.length === 1 && (!offer.depositExclusions[0] || offer.depositExclusions[0].toLowerCase() === 'none' || offer.depositExclusions[0].trim() === ''));
  if (hasExclusions) {
    offer.depositExclusions.forEach(ex => {
      const pill = document.createElement('span');
      pill.className = 'exclusion-pill';
      pill.textContent = ex;
      DOM.modalExclusionsList.appendChild(pill);
    });
  }
  const exclusionsSection = DOM.modalExclusionsList.closest('.modal-section');
  if (exclusionsSection) {
    exclusionsSection.style.display = hasExclusions ? '' : 'none';
  }

  // Set terms detail
  DOM.modalTermsText.textContent = offer.terms;
  const hasTerms = offer.terms && offer.terms.toLowerCase() !== 'none' && offer.terms.trim() !== '' && !offer.terms.includes('Detailed terms here...');
  const termsSection = DOM.modalTermsText.closest('.modal-section');
  if (termsSection) {
    termsSection.style.display = hasTerms ? '' : 'none';
  }

  // Adjust columns layout for exclusions and terms grid wrapper
  const sectionGrid = DOM.termsModal.querySelector('.modal-section-grid');
  if (sectionGrid) {
    if (!hasExclusions && !hasTerms) {
      sectionGrid.style.display = 'none';
    } else {
      sectionGrid.style.display = '';
      if (!hasExclusions || !hasTerms) {
        sectionGrid.style.gridTemplateColumns = '1fr';
      } else {
        sectionGrid.style.gridTemplateColumns = '';
      }
    }
  }

  // Set promo code and toggle display visibility
  DOM.modalPromoCode.textContent = offer.promoCode;
  const hasPromo = offer.promoCode && offer.promoCode.toLowerCase() !== 'none' && offer.promoCode.trim() !== '';
  const promoDisplay = DOM.termsModal.querySelector('.promo-code-display');
  const modalFooter = DOM.termsModal.querySelector('.modal-footer');
  if (promoDisplay && modalFooter) {
    if (hasPromo) {
      promoDisplay.style.display = '';
      modalFooter.style.justifyContent = '';
    } else {
      promoDisplay.style.display = 'none';
      modalFooter.style.justifyContent = 'center';
    }
  }

  DOM.modalVisitBtn.href = offer.url;

  // Open modal animation
  DOM.termsModal.classList.add('open');
  document.body.style.overflow = 'hidden'; // Lock scroll
}

function closeModal() {
  DOM.termsModal.classList.remove('open');
  document.body.style.overflow = ''; // Release scroll
}

// --- Copy Promo Code Helper ---
function copyPromoCode() {
  const code = DOM.modalPromoCode.textContent;
  if (!code || code === 'None') return;

  navigator.clipboard.writeText(code).then(() => {
    // Visual feedback
    const originalText = DOM.modalCopyBtn.textContent;
    DOM.modalCopyBtn.textContent = 'Copied!';
    DOM.modalCopyBtn.style.background = 'var(--secondary)';
    DOM.modalCopyBtn.style.color = '#080b11';

    setTimeout(() => {
      DOM.modalCopyBtn.textContent = originalText;
      DOM.modalCopyBtn.style.background = '';
      DOM.modalCopyBtn.style.color = '';
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy promo code: ', err);
  });
}

// --- Utilities ---
function formatOdds(odds) {
  if (odds === 1.5) return '1/2 (1.5)';
  if (odds === 2.0) return '1/1 (2.0)';
  if (odds === 3.0) return '2/1 (3.0)';
  return `${odds}`;
}

// --- Initialize App Execution ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

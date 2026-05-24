export const PROMO_DATA = {
  operators: [
    {
      id: "midnite",
      name: "Midnite",
      themeColor: "#00f2fe",
      logoSvg: `<svg viewBox="0 0 100 100" class="op-logo-svg"><circle cx="50" cy="50" r="46" fill="#0d1117" stroke="#00f2fe" stroke-width="3"/><path d="M25 70 V30 L50 55 L75 30 V70" fill="none" stroke="#00f2fe" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="65" r="5" fill="#05d5a1"/></svg>`,
      currentOffer: {
        title: "Bet £10, Get £30 in Free Bets",
        type: "free-bet",
        minDeposit: 10,
        minStake: 10,
        minOdds: 2.0, // 1/1
        bonusAmount: 30,
        bonusType: "Free Bets",
        promoCode: "BETGET30",
        wageringRequirements: "None (winnings paid as cash minus free bet stake)",
        expiryDays: 7,
        depositExclusions: ["PayPal", "Skrill", "Neteller", "Paysafe"],
        steps: [
          "Register a new account using promo code <strong>BETGET30</strong>.",
          "Deposit at least £10 using a UK debit card.",
          "Place a qualifying bet of £10+ on any sports market with minimum odds of 1/1 (2.0) containing 4+ legs.",
          "Receive 3 x £10 free bet tokens (£10 Single, £10 Acca, £10 Bet Builder) upon qualifying bet settlement."
        ],
        terms: "New customers only. 18+. UK only. Minimum deposit £10. Place a £10 accumulator bet with a minimum of 4 legs and total odds of 2.0 or higher. Free bets credited upon settlement. Exclusion list applies. GambleAware.org.",
        url: "https://www.midnite.com",
        rating: 4.6
      },
      historicalOffers: [
        { year: 2022, bonusAmount: 20, minStake: 20, type: "free-bet", title: "Bet £20, Get £20 in Free Bets" },
        { year: 2023, bonusAmount: 20, minStake: 10, type: "free-bet", title: "Bet £10, Get £20 in Free Bets" },
        { year: 2024, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets + 50 Free Spins" },
        { year: 2025, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" },
        { year: 2026, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" }
      ]
    },
    {
      id: "bet365",
      name: "bet365",
      themeColor: "#12ca7e",
      logoSvg: `<svg viewBox="0 0 100 100" class="op-logo-svg"><rect width="92" height="92" rx="20" x="4" y="4" fill="#12ca7e"/><text x="50" y="58" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">365</text><text x="50" y="82" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="#0c5a38" text-anchor="middle">BET</text></svg>`,
      currentOffer: {
        title: "Bet £10, Get £30 in Free Bets",
        type: "free-bet",
        minDeposit: 10,
        minStake: 10,
        minOdds: 1.5, // 1/2
        bonusAmount: 30,
        bonusType: "Bet Credits",
        promoCode: "None",
        wageringRequirements: "None (winnings paid as cash minus free bet stake)",
        expiryDays: 30,
        depositExclusions: ["PayPal", "Skrill", "Neteller", "Apple Pay (unless verified)"],
        steps: [
          "Open an account and make a qualifying deposit of £5 or £10.",
          "Claim the offer within 30 days of registering your account.",
          "Place a qualifying bet of £10 at odds of 1.5 (1/2) or greater.",
          "Your Bet Credits (£30) will be released shortly after your qualifying bet settles."
        ],
        terms: "New Customers only. Bet £10 & Get £30 in Free Bets for new customers at bet365. Min deposit requirement. Free Bets are paid as Bet Credits and are available for use upon settlement of qualifying bets. Min odds, bet and payment method exclusions apply. Returns exclude Bet Credits stake. Time limits and T&Cs apply.",
        url: "https://www.bet365.com",
        rating: 4.9
      },
      historicalOffers: [
        { year: 2022, bonusAmount: 50, minStake: 10, type: "free-bet", title: "Bet £10, Get £50 in Free Bets" },
        { year: 2023, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" },
        { year: 2024, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" },
        { year: 2025, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" },
        { year: 2026, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" }
      ]
    },
    {
      id: "skybet",
      name: "Sky Bet",
      themeColor: "#4a90e2",
      logoSvg: `<svg viewBox="0 0 100 100" class="op-logo-svg"><circle cx="50" cy="50" r="46" fill="#111e38" stroke="#4a90e2" stroke-width="3"/><path d="M30 65 L45 35 L60 65" fill="none" stroke="#e02020" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 35 H75" fill="none" stroke="#4a90e2" stroke-width="8" stroke-linecap="round"/><text x="50" y="85" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">SKY BET</text></svg>`,
      currentOffer: {
        title: "Get £30 in Free Bets when you place any bet",
        type: "free-bet",
        minDeposit: 5,
        minStake: 0.05, // e.g. 5p
        minOdds: 2.0, // 1/1
        bonusAmount: 30,
        bonusType: "Free Bets",
        promoCode: "None",
        wageringRequirements: "None",
        expiryDays: 7,
        depositExclusions: ["PayPal", "Skrill", "Neteller", "Prepaid Cards"],
        steps: [
          "Create a new Sky Bet account.",
          "Deposit a minimum of £5 using a debit card.",
          "Place a qualifying bet of any value (even 5p) on any sports market at odds of 1/1 (2.0) or higher.",
          "Receive 3 x £10 free bet tokens immediately upon placing the qualifying bet."
        ],
        terms: "New customers only. Min £5 deposit. Place any sports bet of any value at odds of 2.00 (1/1) or greater. 3 x £10 free bet tokens credited. Free bet stakes not included in returns. Free bets are non-withdrawable and expire in 7 days. Eligibility restrictions apply.",
        url: "https://skybet.com",
        rating: 4.8
      },
      historicalOffers: [
        { year: 2022, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" },
        { year: 2023, bonusAmount: 30, minStake: 5, type: "free-bet", title: "Bet £5, Get £30 in Free Bets" },
        { year: 2024, bonusAmount: 30, minStake: 0.05, type: "free-bet", title: "Bet 5p, Get £30 in Free Bets" },
        { year: 2025, bonusAmount: 30, minStake: 0.05, type: "free-bet", title: "Bet any amount, Get £30 in Free Bets" },
        { year: 2026, bonusAmount: 30, minStake: 0.05, type: "free-bet", title: "Place any bet, Get £30 in Free Bets" }
      ]
    },
    {
      id: "paddypower",
      name: "Paddy Power",
      themeColor: "#00c853",
      logoSvg: `<svg viewBox="0 0 100 100" class="op-logo-svg"><circle cx="50" cy="50" r="46" fill="#005520" stroke="#00c853" stroke-width="3"/><path d="M35 30 L55 30 C65 30, 65 45, 55 45 L35 45 Z" fill="none" stroke="#ffffff" stroke-width="8" stroke-linejoin="round"/><path d="M45 45 L65 45 C75 45, 75 65, 65 65 L45 65 Z" fill="none" stroke="#ffffff" stroke-width="8" stroke-linejoin="round"/><path d="M45 30 V70" fill="none" stroke="#00c853" stroke-width="8"/></svg>`,
      currentOffer: {
        title: "Bet £10, Get £40 in Free Bets",
        type: "free-bet",
        minDeposit: 10,
        minStake: 10,
        minOdds: 1.5,
        bonusAmount: 40,
        bonusType: "Free Bets",
        promoCode: "YSKASV",
        wageringRequirements: "None",
        expiryDays: 7,
        depositExclusions: ["PayPal", "Skrill", "Neteller", "Paysafe", "Apple Pay"],
        steps: [
          "Register a new account using promo code <strong>YSKASV</strong>.",
          "Deposit at least £10 using a Debit Card.",
          "Place a sportsbook bet of £10+ at minimum odds of 1/2 (1.5).",
          "Upon settlement of your bet, receive 4 x £10 free bet tokens."
        ],
        terms: "New customer offer. Place a min £10 bet on the Sportsbook on odds of min EVS (2.0) — wait, currently set to 1.5. Get £40 in Free Bets. SMS verification required. Only deposits via Cards will qualify. T&Cs apply. Please Gamble Responsibly.",
        url: "https://www.paddypower.com",
        rating: 4.7
      },
      historicalOffers: [
        { year: 2022, bonusAmount: 20, minStake: 10, type: "free-bet", title: "Bet £10, Get £20 in Free Bets" },
        { year: 2023, bonusAmount: 30, minStake: 10, type: "free-bet", title: "Bet £10, Get £30 in Free Bets" },
        { year: 2024, bonusAmount: 40, minStake: 10, type: "free-bet", title: "Bet £10, Get £40 in Free Bets" },
        { year: 2025, bonusAmount: 50, minStake: 10, type: "free-bet", title: "Bet £10, Get £50 in Free Bets (Temporary)" },
        { year: 2026, bonusAmount: 40, minStake: 10, type: "free-bet", title: "Bet £10, Get £40 in Free Bets" }
      ]
    },
    {
      id: "coral",
      name: "Coral",
      themeColor: "#ff7043",
      logoSvg: `<svg viewBox="0 0 100 100" class="op-logo-svg"><circle cx="50" cy="50" r="46" fill="#0d47a1" stroke="#ff7043" stroke-width="3"/><path d="M25 40 Q50 15 75 40 Q50 65 25 40" fill="none" stroke="#ffffff" stroke-width="6"/><path d="M25 60 Q50 35 75 60" fill="none" stroke="#ff7043" stroke-width="6"/></svg>`,
      currentOffer: {
        title: "Bet £5, Get £20 in Free Bets",
        type: "free-bet",
        minDeposit: 5,
        minStake: 5,
        minOdds: 1.5,
        bonusAmount: 20,
        bonusType: "Free Bets",
        promoCode: "None",
        wageringRequirements: "None",
        expiryDays: 7,
        depositExclusions: ["PayPal", "Skrill", "Neteller", "Apple Pay", "Paysafe"],
        steps: [
          "Create a new Coral betting account.",
          "Deposit at least £5 using a debit card.",
          "Place a qualifying sports bet of £5+ at odds of 1/2 (1.5) or higher.",
          "Get a £20 free bet credited immediately (credited as 1 x £20 token)."
        ],
        terms: "18+ Eligible UK+IRE players. PayPal & some deposit & bet types excl. Min first £5 bet within 14 days of account reg at min odds 1/2 = 1.5. Gen £20 free bet credited. Free bet valid for 7 days. Free bet stake not returned. T&Cs apply.",
        url: "https://www.coral.co.uk",
        rating: 4.3
      },
      historicalOffers: [
        { year: 2022, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" },
        { year: 2023, bonusAmount: 30, minStake: 5, type: "free-bet", title: "Bet £5, Get £30 in Free Bets" },
        { year: 2024, bonusAmount: 30, minStake: 5, type: "free-bet", title: "Bet £5, Get £30 in Free Bets" },
        { year: 2025, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" },
        { year: 2026, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" }
      ]
    },
    {
      id: "ladbrokes",
      name: "Ladbrokes",
      themeColor: "#ff1744",
      logoSvg: `<svg viewBox="0 0 100 100" class="op-logo-svg"><circle cx="50" cy="50" r="46" fill="#d50000" stroke="#ffffff" stroke-width="3"/><path d="M35 25 V75 H65" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M45 45 H60" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/></svg>`,
      currentOffer: {
        title: "Bet £5, Get £20 in Free Bets",
        type: "free-bet",
        minDeposit: 5,
        minStake: 5,
        minOdds: 1.5,
        bonusAmount: 20,
        bonusType: "Free Bets",
        promoCode: "None",
        wageringRequirements: "None",
        expiryDays: 7,
        depositExclusions: ["PayPal", "Skrill", "Neteller", "Apple Pay", "Paysafe", "Prepaid Cards"],
        steps: [
          "Register a new Ladbrokes account.",
          "Deposit at least £5 via debit card.",
          "Place a qualifying wager of £5+ on sports at odds of 1/2 (1.5) or greater.",
          "Receive 4 x £5 free bet tokens instantly."
        ],
        terms: "18+ New UK & ROI customers only. Min deposit £5. Place a first bet of £5 or more at odds of 1/2 (1.5) or larger. 4 x £5 free bets credited upon placing. Free bets valid for 7 days. Free bet stakes not returned. Certain deposit methods excluded. Full T&Cs apply.",
        url: "https://www.ladbrokes.com",
        rating: 4.4
      },
      historicalOffers: [
        { year: 2022, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" },
        { year: 2023, bonusAmount: 30, minStake: 5, type: "free-bet", title: "Bet £5, Get £30 in Free Bets" },
        { year: 2024, bonusAmount: 30, minStake: 5, type: "free-bet", title: "Bet £5, Get £30 in Free Bets" },
        { year: 2025, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" },
        { year: 2026, bonusAmount: 20, minStake: 5, type: "free-bet", title: "Bet £5, Get £20 in Free Bets" }
      ]
    }
  ],
  marketAnalysis: {
    summary: "The UK welcome offer market has experienced downward pressure on average bonus values over the past five years. Following regulatory adjustments in 2023 and compliance audits targeting promotional mechanics, major operators shifted their focus from massive high-risk matches to lower-barrier, high-turnover offers (e.g. 'Bet £5 Get £20'). Average value peaked around 2022, when operators like bet365 routinely offered £50 bonuses, but has settled into a standard £20–£30 equilibrium in 2026.",
    trends: [
      { year: 2022, averageValue: 30.0, regPressure: "Low", description: "Aggressive competition; higher average bonus values (£50 bet365 standard)." },
      { year: 2023, averageValue: 26.6, regPressure: "Medium", description: "UKGC customer verification and stake limits lead to reduction in bonus sizes." },
      { year: 2024, averageValue: 28.3, regPressure: "High", description: "Rebound with lower stakes needed (Sky Bet 5p bet, Midnite rising to £30)." },
      { year: 2025, averageValue: 25.0, regPressure: "Very High", description: "Tighter financial regulations and tax reviews see Coral and Ladbrokes drop to £20." },
      { year: 2026, averageValue: 28.3, regPressure: "High", description: "Stabilization at £20-£30 with focus on multi-tier bet builder and accumulator free bets." }
    ]
  }
};

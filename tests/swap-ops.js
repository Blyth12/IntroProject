const fs = require('fs');

let content = fs.readFileSync('data.js', 'utf8');

// Regex to remove a complete operator block from the array
function removeOp(id) {
    const regex = new RegExp(`\\{\\s*id:\\s*"${id}"[\\s\\S]*?\\}\\s*\\]\\s*\\},?`, 'g');
    content = content.replace(regex, '');
}

// Remove the 4 missing bookies
removeOp('skybet');
removeOp('paddypower');
removeOp('williamhill');
removeOp('888sport');

// Append the 3 new ones right before the marketAnalysis section
const newOps = `
    },
    {
      id: "betmgm",
      name: "BetMGM",
      themeColor: "#b29759",
      logoSvg: \`<svg viewBox="0 0 100 100" class="op-logo-svg"><rect width="92" height="92" rx="10" x="4" y="4" fill="#000000"/><text x="50" y="55" font-family="'Outfit', sans-serif" font-weight="900" font-size="20" fill="#b29759" text-anchor="middle">BetMGM</text></svg>\`,
      currentOffer: { title: "No Live Data Found", type: "free-bet", minDeposit: 10, minStake: 0, minOdds: 1.5, bonusAmount: 0, bonusType: "Free Bets", promoCode: "None", wageringRequirements: "None", expiryDays: 7, depositExclusions: [], steps: [], terms: "", url: "", rating: 4.5 },
      historicalOffers: []
    },
    {
      id: "livescorebet",
      name: "LiveScore Bet",
      themeColor: "#ff4d00",
      logoSvg: \`<svg viewBox="0 0 100 100" class="op-logo-svg"><rect width="92" height="92" rx="10" x="4" y="4" fill="#ff4d00"/><text x="50" y="55" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">LiveScore</text></svg>\`,
      currentOffer: { title: "No Live Data Found", type: "free-bet", minDeposit: 10, minStake: 0, minOdds: 1.5, bonusAmount: 0, bonusType: "Free Bets", promoCode: "None", wageringRequirements: "None", expiryDays: 7, depositExclusions: [], steps: [], terms: "", url: "", rating: 4.4 },
      historicalOffers: []
    },
    {
      id: "copybet",
      name: "CopyBet",
      themeColor: "#000000",
      logoSvg: \`<svg viewBox="0 0 100 100" class="op-logo-svg"><rect width="92" height="92" rx="10" x="4" y="4" fill="#000000"/><text x="50" y="55" font-family="'Outfit', sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">CopyBet</text></svg>\`,
      currentOffer: { title: "No Live Data Found", type: "free-bet", minDeposit: 10, minStake: 0, minOdds: 1.5, bonusAmount: 0, bonusType: "Free Bets", promoCode: "None", wageringRequirements: "None", expiryDays: 7, depositExclusions: [], steps: [], terms: "", url: "", rating: 4.2 },
      historicalOffers: []
    }
  ],
  marketAnalysis: {
`;

// Target the end of the array and splice in the 3 new ops
content = content.replace(/\s*\]\s*\n\s*\]\,\s*\n\s*marketAnalysis:\s*\{/, newOps);

fs.writeFileSync('data.js', content);
console.log('Successfully swapped operators.');

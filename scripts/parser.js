// Regex-based engine for parsing promotional text strings

/**
 * Extracts structured numerical data from a raw promotion string
 * @param {string} offerStr - e.g. "Bet £10 Get £40 in Free Bets"
 * @returns {object} { stake, bonus, title }
 */
function parseOfferString(offerStr) {
  // Default fallbacks in case regex misses
  let stake = 10;
  let bonus = 20;

  // Match standard UK format: Bet [Stake] Get [Bonus]
  const match = offerStr.match(/Bet\s*£?(\d+(?:\.\d+)?).*?Get\s*£?(\d+(?:\.\d+)?)/i);
  
  if (match) {
    stake = parseFloat(match[1]);
    bonus = parseFloat(match[2]);
  } else {
    // Fallback: match "Get £[Bonus]" or "Get up to £[Bonus]"
    const bonusMatch = offerStr.match(/Get\s*(?:up\s*to\s*)?£?(\d+(?:\.\d+)?)/i);
    if (bonusMatch) {
      bonus = parseFloat(bonusMatch[1]);
      // Check if stake is mentioned separately (e.g. "when you bet £5")
      const stakeMatch = offerStr.match(/bet\s*£?(\d+(?:\.\d+)?)/i);
      if (stakeMatch) {
        stake = parseFloat(stakeMatch[1]);
      } else {
        stake = 0; // Default to 0 stake (any-value bet or no-deposit)
      }
    }
  }

  return { stake, bonus, title: offerStr };
}

module.exports = { parseOfferString };

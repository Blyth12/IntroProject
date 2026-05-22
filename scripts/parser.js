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
  }

  return { stake, bonus, title: offerStr };
}

module.exports = { parseOfferString };

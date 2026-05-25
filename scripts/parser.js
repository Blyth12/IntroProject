// Regex-based engine for parsing promotional text strings

/**
 * Extracts structured numerical data from a raw promotion string
 * @param {string} offerStr - e.g. "Bet £10 Get £40 in Free Bets"
 * @returns {object} { stake, bonus, title }
 */
function parseOfferString(offerStr) {
  // Default fallbacks
  let stake = 10;
  let bonus = 20;

  // Clean percentages first so they don't corrupt the numbers parsing (e.g. "100% Match up to £50")
  const cleanStr = offerStr.replace(/\d+(?:\.\d+)?%/g, '');

  // 1. Match standard UK format: Bet [Stake] Get [Bonus]
  const match = cleanStr.match(/Bet\s*£?(\d+(?:\.\d+)?).*?Get\s*£?(\d+(?:\.\d+)?)/i);
  
  if (match) {
    stake = parseFloat(match[1]);
    bonus = parseFloat(match[2]);
  } else {
    // 2. Fallback: match "Get/up to £[Bonus]"
    const bonusMatch = cleanStr.match(/(?:Get|up\s*to|Match\s*up\s*to|refund\s*up\s*to)\s*£?(\d+(?:\.\d+)?)/i);
    if (bonusMatch) {
      bonus = parseFloat(bonusMatch[1]);
      // Check if stake is mentioned separately (e.g. "when you bet £5")
      const stakeMatch = cleanStr.match(/bet\s*£?(\d+(?:\.\d+)?)/i);
      if (stakeMatch) {
        stake = parseFloat(stakeMatch[1]);
      } else {
        // Check if there is any "deposit of £5" or "deposit £10"
        const depositMatch = cleanStr.match(/deposit\s*£?(\d+(?:\.\d+)?)/i);
        if (depositMatch) {
          stake = parseFloat(depositMatch[1]);
        } else {
          stake = 0; // Default to 0 stake (any-value bet or no-deposit)
        }
      }
    } else {
      // 3. Ultimate numbers-based heuristic fallback:
      // Grab all numbers in the clean string. The max is the bonus, the min is the stake.
      const numbers = cleanStr.match(/\d+(?:\.\d+)?/g);
      if (numbers && numbers.length > 0) {
        const parsedNums = numbers.map(Number);
        bonus = Math.max(...parsedNums);
        if (parsedNums.length > 1) {
          stake = Math.min(...parsedNums);
        } else {
          stake = 0; // Single number: assume it's the bonus, stake is 0
        }
      }
    }
  }
  return { stake, bonus, title: offerStr };
}

function categorizeOfferType(offerStr) {
  if (!offerStr) return 'free-bet';
  const str = offerStr.toLowerCase();
  if (str.includes('no deposit') || str.includes('no-deposit')) {
    return 'no-deposit';
  }
  if (str.includes('money back') || str.includes('refund') || str.includes('loses') || str.includes('risk free') || str.includes('risk-free')) {
    return 'money-back';
  }
  if (str.includes('deposit match') || str.includes('match') || str.includes('matched')) {
    return 'deposit-match';
  }
  // Check free bets before spins to ensure hybrid offers (Free Bets + Spins) classify as free-bet
  if (str.includes('free bet') || str.includes('bet credits') || str.includes('freebets')) {
    return 'free-bet';
  }
  if (str.includes('spins') || str.includes('free spins') || str.includes('fs')) {
    return 'free-spins';
  }
  return 'free-bet';
}

module.exports = { parseOfferString, categorizeOfferType };

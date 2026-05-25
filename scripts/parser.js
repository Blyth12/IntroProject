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

  // Clean brand numbers so they don't corrupt the numbers parsing
  let cleanStr = offerStr
    .replace(/bet365/ig, 'bet')
    .replace(/888casino/ig, 'casino')
    .replace(/10bet/ig, 'bet')
    .replace(/32red/ig, 'red');

  // Clean percentages first so they don't corrupt the numbers parsing (e.g. "100% Match up to £50")
  cleanStr = cleanStr.replace(/\d+(?:\.\d+)?%/g, '');

  // 1. Match standard UK format: Bet [Stake] Get [Bonus]
  const match = cleanStr.match(/Bet\s*£?(\d+(?:\.\d+)?).*?Get\s*£?(\d+(?:\.\d+)?)/i);
  
  if (match) {
    stake = parseFloat(match[1]);
    bonus = parseFloat(match[2]);
  } else {
    // 2. Check explicitly for "Worth £X" or "worth £X"
    const worthMatch = cleanStr.match(/worth\s*(?:up\s*to\s*)?£?(\d+(?:\.\d+)?)/i);
    if (worthMatch) {
      bonus = parseFloat(worthMatch[1]);
      // Search for stake separately (e.g. "when you bet £5" or "deposit £10")
      const stakeMatch = cleanStr.match(/bet\s*£?(\d+(?:\.\d+)?)/i) || cleanStr.match(/deposit\s*£?(\d+(?:\.\d+)?)/i);
      if (stakeMatch) {
        stake = parseFloat(stakeMatch[1]);
      } else {
        stake = 0; // Default to 0 stake (any-value bet or no-deposit)
      }
    } else {
      // 3. Fallback: match "Get/up to £[Bonus]"
      const bonusMatch = cleanStr.match(/(?:Get|up\s*to|Match\s*up\s*to|refund\s*up\s*to)\s*£?(\d+(?:\.\d+)?)/i);
      if (bonusMatch) {
        bonus = parseFloat(bonusMatch[1]);
        const stakeMatch = cleanStr.match(/bet\s*£?(\d+(?:\.\d+)?)/i) || cleanStr.match(/deposit\s*£?(\d+(?:\.\d+)?)/i);
        if (stakeMatch) {
          stake = parseFloat(stakeMatch[1]);
        } else {
          stake = 0;
        }
      } else {
        // 4. Ultimate numbers-based heuristic fallback:
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
  }

  // Handle free spins or tickets count conversion to cash value
  const isSpins = /spins|fs/i.test(cleanStr);
  const isTickets = /tickets/i.test(cleanStr);
  
  if (isSpins || isTickets) {
    // Check if the matched bonus value is likely a count (i.e. does not have a £ sign directly before it in the original text)
    const hasPoundPrefix = new RegExp('£' + bonus, 'i').test(offerStr) || new RegExp('£\\s*' + bonus, 'i').test(offerStr);
    
    // If it's a count, convert to monetary value (£0.10 per spin/ticket)
    if (!hasPoundPrefix && bonus >= 10) {
      bonus = bonus * 0.10;
    }
  }

  return { stake, bonus, title: offerStr };
}

function categorizeOfferType(offerStr) {
  if (!offerStr) return 'free-bet';
  const str = offerStr.toLowerCase();
  if (str.includes('bingo')) {
    return 'bingo';
  }
  if (str.includes('spins') || str.includes('free spins') || str.includes('fs')) {
    return 'free-spins-no-deposit';
  }
  return 'free-bet';
}

module.exports = { parseOfferString, categorizeOfferType };

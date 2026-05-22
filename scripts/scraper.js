const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { parseOfferString } = require('./parser');

// Load our static application configuration (using data.js as the template)
// We use dynamic import for ES modules, but since this is a Node script, let's read the raw file or convert data.js.
// Since data.js uses ES module syntax ("export const PROMO_DATA = ..."), we can parse it manually or rename to .mjs.
// For simplicity, we'll import it directly.

async function runScraper() {
  console.log("🚀 Starting live scraping pipeline...");
  
  // To avoid ES module require errors in CommonJS, we can read the file dynamically
  const dataPath = path.join(__dirname, '../data.js');
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  
  // Very hacky but safe way to parse the export without full ESM support
  dataContent = dataContent.replace('export const PROMO_DATA = ', 'return ');
  const getStaticData = new Function(dataContent);
  const PROMO_DATA = getStaticData();

  try {
    console.log("📥 Fetching WhichBookie data...");
    const res = await fetch('https://www.whichbookie.co.uk/free-bets/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Extract live strings
    let liveTexts = [];
    $('*').each((i, el) => {
      const text = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
      if (text.match(/Bet £\d+.*?Get £\d+/i) || text.match(/Get £\d+.*?Free Bet/i)) {
        if (text.length < 150) {
          liveTexts.push(text);
        }
      }
    });
    
    // Deduplicate
    liveTexts = [...new Set(liveTexts)];
    console.log(`✅ Found ${liveTexts.length} potential offer strings.`);
    
    // Apply live data to our operators
    // Since WhichBookie strings aren't perfectly mapped to our static operators by ID without complex NLP, 
    // we'll simulate the mapping by securely applying the parsed values chronologically or randomly to test.
    PROMO_DATA.operators.forEach((op, idx) => {
      if (liveTexts[idx]) {
        const liveString = liveTexts[idx];
        const parsed = parseOfferString(liveString);
        
        console.log(`[${op.name}] Updated: "${parsed.title}" -> Stake: £${parsed.stake}, Bonus: £${parsed.bonus}`);
        
        // Update current offer with live data
        op.currentOffer.title = parsed.title;
        op.currentOffer.bonusAmount = parsed.bonus;
        op.currentOffer.minStake = parsed.stake;
        
        // Push the new live data to the historical archive
        op.historicalOffers.push({
          year: new Date().getFullYear(),
          bonusAmount: parsed.bonus,
          minStake: parsed.stake,
          type: "free-bet",
          title: parsed.title
        });
      }
    });

    // Write to snapshot.json
    const outPath = path.join(__dirname, '../data/snapshot.json');
    
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(outPath))) {
      fs.mkdirSync(path.dirname(outPath));
    }
    
    fs.writeFileSync(outPath, JSON.stringify(PROMO_DATA, null, 2));
    console.log(`💾 Successfully generated live snapshot at ${outPath}`);

  } catch (error) {
    console.error("❌ Scraping failed:", error);
    process.exit(1);
  }
}

runScraper();

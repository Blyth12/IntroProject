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

  // Wipe all sample data from memory so only successfully scraped data is shown!
  PROMO_DATA.operators.forEach(op => {
    op.currentOffer.title = "No Live Data Found (Scrape Failed)";
    op.currentOffer.bonusAmount = 0;
    op.currentOffer.minStake = 0;
  });

  try {
    console.log("📥 Fetching WhichBookie data...");
    const res = await fetch('https://www.whichbookie.co.uk/free-bets/');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Extract live strings with HTML context
    let scrapedOffers = [];
    $('*').each((i, el) => {
      const directText = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
      if (directText.match(/Bet £\d+.*?Get £\d+/i) || directText.match(/Get £\d+.*?Free Bet/i)) {
        if (directText.length < 150) {
           // Climb up exactly 3 nodes to capture the individual operator's card wrapper
           const contextText = $(el).parent().parent().parent().text().replace(/\s+/g, ' ').toLowerCase();
           scrapedOffers.push({ offerText: directText, contextText: contextText });
        }
      }
    });
    
    console.log(`✅ Found ${scrapedOffers.length} potential offer nodes in DOM.`);
    
    // Apply live data by contextual mapping
    PROMO_DATA.operators.forEach((op) => {
      // Normalize name to catch "WilliamHill" vs "William Hill"
      const normalizedOpName = op.name.toLowerCase().replace(/\s+/g, '');
      const match = scrapedOffers.find(so => so.contextText.replace(/\s+/g, '').includes(normalizedOpName));
      
      if (match) {
        const liveString = match.offerText;
        const parsed = parseOfferString(liveString);
        
        console.log(`[${op.name}] Explicitly Matched: "${parsed.title}" -> Stake: £${parsed.stake}, Bonus: £${parsed.bonus}`);
        
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

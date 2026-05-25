const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { parseOfferString } = require('./parser');

function getCardContainer($, $el) {
  let current = $el;
  for (let i = 0; i < 5; i++) {
    const parent = current.parent();
    if (!parent || parent.length === 0) break;
    const className = (parent.attr('class') || '').toLowerCase();
    const id = (parent.attr('id') || '').toLowerCase();
    const tagName = parent[0].tagName.toLowerCase();
    
    // Stop if parent is a container or page layout element
    if (className.includes('columns') || className.includes('main') || className.includes('content') || 
        className.includes('wrapper') || className.includes('grid') || className.includes('list') || 
        className.includes('layout') || className.includes('body') || className.includes('header') || 
        className.includes('footer') || className.includes('container') || tagName === 'body' || tagName === 'html') {
      return current; // Return current which is the child of the container
    }
    
    // Stop if parent is explicitly a card/tip wrapper (and NOT an inner element detail)
    const isCard = className.includes('freebet') || className.includes('card') || className.includes('row') || 
                   className.includes('tip') || className.includes('item') || className.includes('offer');
                   
    const isInner = ['title', 'text', 'line', 'header', 'icon', 'btn', 'button', 'link', 'terms', 'desc', 'logo', 'badge', 'meta', 'info', 'label'].some(kw => className.includes(kw));
    
    if (isCard && !isInner) {
      return parent;
    }
    
    current = parent;
  }
  return current;
}

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
      const match = directText.match(/Bet\s*£?(\d+(?:\.\d+)?)\s*(?:and)?\s*Get\s*£?(\d+(?:\.\d+)?)/i) || 
                    directText.match(/Get\s*£?(\d+(?:\.\d+)?)\s*Free\s*Bet/i);
      if (match) {
        if (directText.length < 350) {
           const card = getCardContainer($, $(el));
           const contextText = card.text().replace(/\s+/g, ' ').toLowerCase();
           scrapedOffers.push({ offerText: match[0], contextText: contextText });
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
        
        // Push or update current year live data in historicalOffers
        const currentYear = new Date().getFullYear();
        const existingIndex = op.historicalOffers.findIndex(h => h.year === currentYear);
        const offerObj = {
          year: currentYear,
          bonusAmount: parsed.bonus,
          minStake: parsed.stake,
          type: "free-bet",
          title: parsed.title
        };
        
        if (existingIndex !== -1) {
          op.historicalOffers[existingIndex] = offerObj;
        } else {
          op.historicalOffers.push(offerObj);
        }
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

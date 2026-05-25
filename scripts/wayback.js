const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { parseOfferString, categorizeOfferType } = require('./parser');

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

async function runWaybackScraper() {
  console.log("🚀 Starting Wayback Machine historical backfill...");

  // Load existing data.js
  const dataPath = path.join(__dirname, '../data.js');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ data.js not found at ${dataPath}`);
    process.exit(1);
  }
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  let parseContent = dataContent.replace('export const PROMO_DATA = ', 'return ');
  // Handle trailing semicolon if any
  parseContent = parseContent.replace(/;\s*$/, '');
  const getStaticData = new Function(parseContent);
  const PROMO_DATA = getStaticData();

  const snapshots = {
    2022: '20220525073001',
    2023: '20231210081353',
    2024: '20240421060214',
    2025: '20250121224833'
  };

  for (const [yearStr, timestamp] of Object.entries(snapshots)) {
    const year = parseInt(yearStr, 10);
    const url = `https://web.archive.org/web/${timestamp}/https://www.whichbookie.co.uk/free-bets/`;
    console.log(`\n📥 Fetching ${year} snapshot from Wayback (${timestamp})...`);
    
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      
      let scrapedOffers = [];
      $('*').each((i, el) => {
        const directText = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
        const match = directText.match(/Bet\s*£?(\d+(?:\.\d+)?)\s*(?:and)?\s*Get\s*£?(\d+(?:\.\d+)?)/i) || 
                      directText.match(/Get\s*£?(\d+(?:\.\d+)?)\s*Free\s*Bet/i);
        if (match) {
          if (directText.length < 350) {
             const card = getCardContainer($, $(el));
             const contextText = card.text().replace(/\s+/g, ' ').toLowerCase();
             scrapedOffers.push({ 
               offerText: match[0], 
               contextText: contextText
             });
          }
        }
      });

      console.log(`  Found ${scrapedOffers.length} raw offer nodes in DOM.`);

      PROMO_DATA.operators.forEach(op => {
        const normalizedOpName = op.name.toLowerCase().replace(/\s+/g, '');
        const match = scrapedOffers.find(so => so.contextText.replace(/\s+/g, '').includes(normalizedOpName));
        
        // Find if this year's data is already present in historicalOffers
        const existingIndex = op.historicalOffers.findIndex(h => h.year === year);
        
        if (match) {
          const parsed = parseOfferString(match.offerText);
          const offerObj = {
            year,
            bonusAmount: parsed.bonus,
            minStake: parsed.stake,
            type: categorizeOfferType(parsed.title),
            title: parsed.title
          };
          
          if (existingIndex !== -1) {
            console.log(`  [${op.name}] Already exists for ${year}. Updating type if needed.`);
            op.historicalOffers[existingIndex].type = categorizeOfferType(parsed.title);
          } else {
            console.log(`  [${op.name}] Adding ${year}: "${parsed.title}" (Stake: £${parsed.stake}, Bonus: £${parsed.bonus})`);
            op.historicalOffers.push(offerObj);
          }
        } else {
          // Direct match check in offerText directly
          const directMatch = scrapedOffers.find(so => so.offerText.toLowerCase().includes(normalizedOpName));
          if (directMatch) {
            const parsed = parseOfferString(directMatch.offerText);
            const offerObj = {
              year,
              bonusAmount: parsed.bonus,
              minStake: parsed.stake,
              type: categorizeOfferType(parsed.title),
              title: parsed.title
            };
            if (existingIndex !== -1) {
              console.log(`  [${op.name}] Already exists for ${year} (Direct match). Updating type if needed.`);
              op.historicalOffers[existingIndex].type = categorizeOfferType(parsed.title);
            } else {
              console.log(`  [${op.name}] Adding ${year} (Direct match): "${parsed.title}" (Stake: £${parsed.stake}, Bonus: £${parsed.bonus})`);
              op.historicalOffers.push(offerObj);
            }
          }
        }
      });
    } catch (err) {
      console.error(`  ❌ Error processing ${year}:`, err.message);
    }
  }

  // Ensure all historicalOffers are sorted ascending by year
  PROMO_DATA.operators.forEach(op => {
    op.historicalOffers.sort((a, b) => a.year - b.year);
  });

  // Write back to data.js
  const outputContent = `export const PROMO_DATA = ${JSON.stringify(PROMO_DATA, null, 2)};\n`;
  fs.writeFileSync(dataPath, outputContent, 'utf8');
  console.log(`\n💾 Successfully updated ${dataPath} with historical data!`);
}

runWaybackScraper();

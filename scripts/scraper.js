const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { parseOfferString, categorizeOfferType } = require('./parser');

function cleanBrandNumbers(str) {
  return str
    .replace(/bet365/ig, 'bet')
    .replace(/888casino/ig, 'casino')
    .replace(/10bet/ig, 'bet')
    .replace(/32red/ig, 'red');
}

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

    // Stop if parent contains links to more than 1 operator (it's a container of cards)
    const betLinks = [];
    parent.find('a').each((k, a) => {
      const href = $(a).attr('href') || '';
      if (href.includes('/bet/') && !betLinks.includes(href)) {
        betLinks.push(href);
      }
    });
    if (betLinks.length > 1) {
      return current;
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

function extractRedirectLink($, card, sourceUrl) {
  let link = '';
  card.find('a').each((i, a) => {
    let href = $(a).attr('href') || '';
    if (!href) return;
    
    // Resolve relative URLs to absolute WhichBookie URLs
    if (href.startsWith('/')) {
      href = 'https://www.whichbookie.co.uk' + href;
    }
    
    // Check if it's a redirect / claim link
    const isRedirect = href.includes('/bet/') || href.includes('/visit/') || href.includes('/go/');
    if (isRedirect) {
      link = href;
      return false; // Break loop
    }
  });
  
  // Fallback to first link inside card if no /bet/ link is found
  if (!link) {
    card.find('a').each((i, a) => {
      let href = $(a).attr('href') || '';
      if (href && !href.includes('review') && !href.includes('#')) {
        if (href.startsWith('/')) {
          href = 'https://www.whichbookie.co.uk' + href;
        }
        link = href;
        return false; // Break loop
      }
    });
  }
  
  return link || sourceUrl;
}

const offerPatterns = [
  /Bet\s*£?(\d+(?:\.\d+)?).*?Get\s*£?(\d+(?:\.\d+)?)/i, // Bet X Get Y
  /Deposit\s*£?(\d+(?:\.\d+)?).*?Get\s*£?(\d+(?:\.\d+)?)/i, // Deposit X Get Y
  /Get\s*£?(\d+(?:\.\d+)?)\s*(?:Free\s*Bet|Bonus|Free\s*Spins|Money\s*Back|Bingo)/i, // Get X ...
  /£?(\d+(?:\.\d+)?)\s*(?:Free\s*Bet|Bonus|Free\s*Spins|Money\s*Back|Bingo)/i,       // X Free Bet/Bonus/Spins/Money Back
  /£?(\d+(?:\.\d+)?)\s*(?:Wager-Free\s+|in\s+)*Bingo\s*(?:Bonus|Tickets|Money)/i, // X Bingo Bonus/Tickets
  /(\d+)\s*(?:Free\s*)?Bingo\s*(?:Tickets|Bonus)/i, // X Bingo Tickets
  /Worth\s*£?(\d+(?:\.\d+)?)/i, // Worth X
  /Match\s*up\s*to\s*£?(\d+)/i,                                                // Match up to X
  /Refund\s*up\s*to\s*£?(\d+)/i,                                                // Refund up to X
  /No\s*Deposit\s*£?(\d+)/i,                                                   // No Deposit X
  /£?(\d+)\s*No\s*Deposit/i                                                    // X No Deposit
];

function extractOffersFromHtml(html, sourceUrl) {
  const $ = cheerio.load(html);
  let scraped = [];
  
  $('*').each((i, el) => {
    const rawText = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
    const directText = cleanBrandNumbers(rawText);
    
    if (directText.length > 5 && directText.length < 150) {
      const match = offerPatterns.some(regex => regex.test(directText));
      if (match) {
        const card = getCardContainer($, $(el));
        
        // Build richer context text including all href attributes inside the card
        let contextText = card.text().replace(/\s+/g, ' ').toLowerCase();
        card.find('a').each((j, linkEl) => {
          const href = $(linkEl).attr('href') || '';
          contextText += ' ' + href.toLowerCase();
        });
        
        const redirectUrl = extractRedirectLink($, card, sourceUrl);
        
        scraped.push({ 
          offerText: rawText, 
          contextText: contextText,
          redirectUrl: redirectUrl
        });
      }
    }
  });
  
  return scraped;
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

  const scrapePages = [
    { url: 'https://www.whichbookie.co.uk/free-bets/', priority: 3, type: 'free-bet' },
    { url: 'https://www.whichbookie.co.uk/casino-bonuses/100-free-spins-no-deposit/', priority: 2, type: 'free-spins-no-deposit' },
    { url: 'https://www.whichbookie.co.uk/bingo/', priority: 1, type: 'bingo' }
  ];

  try {
    let allScrapedOffers = [];
    
    for (const page of scrapePages) {
      console.log(`📥 Fetching WhichBookie: ${page.url}...`);
      try {
        const res = await fetch(page.url);
        if (!res.ok) {
          console.warn(`⚠️ Failed to fetch ${page.url}: HTTP ${res.status}`);
          continue;
        }
        const html = await res.text();
        const pageOffers = extractOffersFromHtml(html, page.url);
        console.log(`  Found ${pageOffers.length} potential offer nodes.`);
        
        pageOffers.forEach(o => {
          o.priority = page.priority;
          o.sourceUrl = page.url;
          o.type = page.type;
        });
        
        allScrapedOffers.push(...pageOffers);
      } catch (err) {
        console.warn(`⚠️ Error fetching ${page.url}: ${err.message}`);
      }
    }
    
    console.log(`✅ Total gathered potential offer nodes across pages: ${allScrapedOffers.length}`);
    
    // Apply live data by contextual mapping
    PROMO_DATA.operators.forEach((op) => {
      const normalizedOpName = op.name.toLowerCase().replace(/\s+/g, '');
      const matches = allScrapedOffers.filter(so => {
        const normContext = so.contextText.replace(/\s+/g, '');
        if (normContext.includes(normalizedOpName)) {
          return true;
        }
        // Aliases / variations
        if (normalizedOpName === 'skybet' && normContext.includes('skyvegas')) {
          return true;
        }
        if (normalizedOpName === 'livescorebet' && normContext.includes('livescore')) {
          return true;
        }
        return false;
      });
      
      if (matches.length > 0) {
        // Sort matches by priority descending
        matches.sort((a, b) => b.priority - a.priority);
        
        const bestMatch = matches[0];
        const parsed = parseOfferString(bestMatch.offerText);
        
        if (parsed.bonus > 0) {
          console.log(`[${op.name}] Matched: "${parsed.title}" (Type: ${bestMatch.type}) from ${bestMatch.sourceUrl}`);
          
          op.currentOffer.title = parsed.title;
          op.currentOffer.bonusAmount = parsed.bonus;
          op.currentOffer.minStake = parsed.stake;
          op.currentOffer.type = bestMatch.type;
          op.currentOffer.url = bestMatch.redirectUrl; // Set dynamic url to the operator's tracking redirect link
          
          // Map type to user-friendly bonusType badge name
          if (bestMatch.type === 'free-bet') {
            op.currentOffer.bonusType = 'Free Bets';
          } else if (bestMatch.type === 'free-spins-no-deposit') {
            op.currentOffer.bonusType = 'Free Spins';
          } else if (bestMatch.type === 'bingo') {
            op.currentOffer.bonusType = 'Bingo Bonus';
          }
          
          // Push or update current year live data in historicalOffers
          const currentYear = new Date().getFullYear();
          const existingIndex = op.historicalOffers.findIndex(h => h.year === currentYear);
          const offerObj = {
            year: currentYear,
            bonusAmount: parsed.bonus,
            minStake: parsed.stake,
            type: bestMatch.type,
            title: parsed.title
          };
          
          if (existingIndex !== -1) {
            op.historicalOffers[existingIndex] = offerObj;
          } else {
            op.historicalOffers.push(offerObj);
          }
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

    // Also write back to data.js so the local dev server (vite) displays the latest scraped offers!
    const outputContent = `export const PROMO_DATA = ${JSON.stringify(PROMO_DATA, null, 2)};\n`;
    fs.writeFileSync(dataPath, outputContent, 'utf8');
    console.log(`💾 Successfully updated database at ${dataPath}`);

  } catch (error) {
    console.error("❌ Scraping failed:", error);
    process.exit(1);
  }
}

runScraper();

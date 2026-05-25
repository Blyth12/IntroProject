const cheerio = require('cheerio');

async function inspect() {
  const res = await fetch('https://www.whichbookie.co.uk/free-bets/');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let scrapedOffers = [];
  $('*').each((i, el) => {
    const directText = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
    if (directText.match(/Bet £\d+.*?Get £\d+/i) || directText.match(/Get £\d+.*?Free Bet/i)) {
      if (directText.length < 150) {
         // Grab text from the parent wrapper (climbing up the DOM tree slightly) to catch the operator name
         const contextText = $(el).parent().parent().parent().text().replace(/\s+/g, ' ').toLowerCase();
         scrapedOffers.push({ offer: directText, context: contextText });
      }
    }
  });
  
  // Test mapping
  const operators = ["bet365", "ladbrokes", "coral", "betfred", "william hill", "betvictor"];
  operators.forEach(op => {
    const match = scrapedOffers.find(so => so.context.includes(op));
    if (match) {
      console.log(`[${op.toUpperCase()}] explicitly matched to: "${match.offer}"`);
    } else {
      console.log(`[${op.toUpperCase()}] No deal found in context.`);
    }
  });
}
inspect();

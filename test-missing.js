const cheerio = require('cheerio');

async function test() {
  const res = await fetch('https://www.whichbookie.co.uk/free-bets/');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  $('*').each((i, el) => {
    const t = $(el).clone().children().remove().end().text().replace(/\s+/g, ' ').trim();
    if (t.match(/Bet £\d+.*?Get £\d+/i) || t.match(/Get £\d+.*?Free Bet/i)) {
      if (t.length < 150) {
        const parentHtml = $(el).parent().parent().parent().html();
        if (parentHtml.toLowerCase().includes('sky') || parentHtml.toLowerCase().includes('paddy') || parentHtml.toLowerCase().includes('william')) {
           console.log('--- FOUND MATCH FOR MISSING OP ---');
           console.log('Offer:', t);
           const altText = $(el).parent().parent().parent().find('img').map((_, img) => $(img).attr('alt')).get().join(', ');
           console.log('Image Alts:', altText);
           console.log('Class Names:', $(el).parent().parent().parent().attr('class'));
        }
      }
    }
  });
}
test();

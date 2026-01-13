import { sendDiscord } from './discord.js';
import 'dotenv/config';

const DATA_API = 'https://data-api.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

const knownWallets = new Set();
const USD_THRESHOLD = 5000; // $5,000 minimum

// Sports keywords to filter by
const SPORTS_KEYWORDS = [
  'nba', 'nfl', 'nhl', 'mlb', 'soccer', 'football', 'basketball', 
  'hockey', 'baseball', 'sports',

  // NBA teams
  '76ers', 'bucks', 'bulls', 'cavaliers', 'celtics', 'clippers', 
  'grizzlies', 'hawks', 'heat', 'hornets', 'jazz', 'kings', 
  'knicks', 'lakers', 'magic', 'mavericks', 'nets', 'nuggets', 
  'pacers', 'pelicans', 'pistons', 'raptors', 'rockets', 'spurs', 
  'suns', 'thunder', 'timberwolves', 'trail-blazers', 'trail blazers', 
  'warriors', 'wizards',

  // NFL teams
  '49ers', 'bears', 'bengals', 'bills', 'broncos', 'browns', 
  'buccaneers', 'cardinals', 'chargers', 'chiefs', 'colts', 'commanders', 
  'cowboys', 'dolphins', 'eagles', 'falcons', 'giants', 'jaguars', 
  'jets', 'lions', 'packers', 'panthers', 'patriots', 'raiders', 
  'rams', 'ravens', 'saints', 'seahawks', 'steelers', 'texans', 
  'titans', 'vikings',

  // NHL teams
  'avalanche', 'blackhawks', 'blue jackets', 'bruins', 'canadiens', 
  'canucks', 'capitals', 'coyotes', 'devils', 'ducks', 'flames', 
  'flyers', 'golden knights', 'hurricanes', 'islanders', 'kraken', 
  'kings', 'lightning', 'maple leafs', 'maple-leafs', 'oilers', 
  'panthers', 'penguins', 'predators', 'rangers', 'red wings', 
  'sabres', 'senators', 'sharks', 'stars', 'utah mammoth', 'mammoth', 
  'wild',



];

function isSportsEvent(trade) {
  const slug = (trade.eventSlug || trade.slug || '').toLowerCase();
  const title = (trade.title || '').toLowerCase();
  
  return SPORTS_KEYWORDS.some(keyword => 
    slug.includes(keyword) || title.includes(keyword)
  );
}

async function getRecentTrades(afterTimestamp) {
  const trades = await fetch(
    `${DATA_API}/trades?after=${afterTimestamp}&limit=500`
  ).then(r => r.json());

  const anomalies = [];

  for (const trade of trades) {
    const usdValue = parseFloat(trade.usdValue) || (parseFloat(trade.size) * parseFloat(trade.price));

    const isHighVolume = usdValue >= USD_THRESHOLD;
    const isNewWallet = !knownWallets.has(trade.proxyWallet);
    const isSports = isSportsEvent(trade);

    if (isNewWallet && isHighVolume && isSports) {
      anomalies.push({ ...trade, usdValue });
    }
    knownWallets.add(trade.proxyWallet);
  }

  return anomalies;
}

async function checkForAnomalies() {
  console.log('Checking for sports anomalies...', new Date().toISOString());
  const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;

  try {
    const anomalies = await getRecentTrades(oneHourAgo);

    for (const trade of anomalies) {
      const tradeTime = trade.timestamp
        ? new Date(typeof trade.timestamp === 'number' ? trade.timestamp * 1000 : trade.timestamp).toISOString()
        : 'Unknown';

      const message = `🏀🏈🏒 **High Volume Sports Trade Alert**
• **Event:** ${trade.title}
• **Outcome:** ${trade.outcome}
• **Side:** ${trade.side}
• **USD Value:** $${trade.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
• **Size:** ${trade.size} shares @ $${trade.price}
• **Wallet:** ${trade.proxyWallet}
• **User:** ${trade.pseudonym || 'Anonymous'}
• **Tx:** https://polygonscan.com/tx/${trade.transactionHash}
• **Time:** ${tradeTime}`;

      await sendDiscord(message);
    }

    if (!anomalies.length) {
      console.log('No sports anomalies detected.');
    //  const message = `✅ **No Anomalies Detected**
//No high-volume trades from new wallets in the last hour.
// ${new Date().toISOString()}`;

 // await sendDiscord(message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run immediately on start
checkForAnomalies();

let intervalAmount = 120000 ; // 2 minutes

setInterval(checkForAnomalies, intervalAmount);





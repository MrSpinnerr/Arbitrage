import { Sport, SPORT_API_KEYS, UK_BOOKMAKERS, OddsAPIResponse, SureBet, Outcome } from '../types';

const ODDS_API_KEY = '243a45a5b22aaec6b776b80b857d769d';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

export const fetchOddsFromAPI = async (sports: Sport[]): Promise<SureBet[]> => {
  const allSureBets: SureBet[] = [];

  for (const sport of sports) {
    const sportKeys = SPORT_API_KEYS[sport].split(',');
    
    for (const sportKey of sportKeys) {
      try {
        console.log(`[OddsAPI] Fetching ${sportKey}...`);
        
        const url = `${ODDS_API_BASE}/sports/${sportKey}/odds/?` + new URLSearchParams({
          apiKey: ODDS_API_KEY,
          regions: 'uk',
          markets: 'h2h',
          oddsFormat: 'decimal',
          bookmakers: UK_BOOKMAKERS.join(',')
        });

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`[OddsAPI] Error fetching ${sportKey}: ${response.status}`);
          continue;
        }

        const data: OddsAPIResponse[] = await response.json();
        
        // Check remaining API quota
        const remainingRequests = response.headers.get('x-requests-remaining');
        console.log(`[OddsAPI] Remaining requests: ${remainingRequests}`);

        // Process each event and find arbitrage opportunities
        for (const event of data) {
          const sureBet = findArbitrageOpportunity(event, sport);
          if (sureBet) {
            allSureBets.push(sureBet);
          }
        }
        
      } catch (error) {
        console.error(`[OddsAPI] Failed to fetch ${sportKey}:`, error);
      }
    }
  }

  return allSureBets;
};

const findArbitrageOpportunity = (event: OddsAPIResponse, sport: Sport): SureBet | null => {
  // Extract all bookmaker odds for this event
  const bookmakerOdds: Map<string, { name: string; price: number }[]> = new Map();

  event.bookmakers.forEach(bookmaker => {
    const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h');
    if (h2hMarket && h2hMarket.outcomes.length >= 2) {
      bookmakerOdds.set(bookmaker.key, h2hMarket.outcomes);
    }
  });

  if (bookmakerOdds.size < 2) {
    return null; // Need at least 2 bookmakers
  }

  // Get all unique outcome names (e.g., "Home", "Draw", "Away" or "Player A", "Player B")
  const outcomeNames = new Set<string>();
  bookmakerOdds.forEach(outcomes => {
    outcomes.forEach(outcome => outcomeNames.add(outcome.name));
  });

  // Find best odds for each outcome across all bookmakers
  const bestOdds: Outcome[] = [];
  
  outcomeNames.forEach(outcomeName => {
    let bestPrice = 0;
    let bestBookmaker = '';

    bookmakerOdds.forEach((outcomes, bookmakerKey) => {
      const outcome = outcomes.find(o => o.name === outcomeName);
      if (outcome && outcome.price > bestPrice) {
        bestPrice = outcome.price;
        bestBookmaker = bookmakerKey;
      }
    });

    if (bestBookmaker) {
      bestOdds.push({
        bookmaker: bestBookmaker,
        price: bestPrice,
        label: outcomeName,
        link: `https://${bestBookmaker}.com`
      });
    }
  });

  // Calculate arbitrage opportunity
  if (bestOdds.length < 2) {
    return null;
  }

  const inverseSum = bestOdds.reduce((sum, outcome) => sum + (1 / outcome.price), 0);
  
  // If inverse sum < 1, we have an arbitrage opportunity
  if (inverseSum < 1) {
    const profitPercentage = ((1 / inverseSum) - 1) * 100;

    return {
      id: event.id,
      sport: sport,
      event: event.home_team && event.away_team 
        ? `${event.home_team} vs ${event.away_team}`
        : event.sport_title,
      commenceTime: event.commence_time,
      profitPercentage: profitPercentage,
      lastUpdated: new Date().toISOString(),
      outcomes: bestOdds,
      isExpired: false
    };
  }

  return null;
};

export const checkAPIQuota = async (): Promise<number> => {
  try {
    const url = `${ODDS_API_BASE}/sports/?apiKey=${ODDS_API_KEY}`;
    const response = await fetch(url);
    const remaining = response.headers.get('x-requests-remaining');
    return remaining ? parseInt(remaining) : 0;
  } catch (error) {
    console.error('[OddsAPI] Failed to check quota:', error);
    return 0;
  }
};

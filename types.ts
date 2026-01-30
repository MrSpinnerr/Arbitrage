// Updated types for real Odds API integration

export enum Sport {
  FOOTBALL = 'Football',
  TENNIS = 'Tennis',
  HORSE_RACING = 'Horse Racing'
}

export const SPORT_API_KEYS: Record<Sport, string> = {
  [Sport.FOOTBALL]: 'soccer_epl,soccer_england_championship,soccer_fa_cup',
  [Sport.TENNIS]: 'tennis_atp,tennis_wta',
  [Sport.HORSE_RACING]: 'horse_racing_uk'
};

export type OddsFormat = 'decimal' | 'fractional';

// UK Bookmakers supported by The Odds API
export const UK_BOOKMAKERS = [
  'bet365',
  'williamhill',
  'ladbrokes',
  'coral',
  'paddypower',
  'skybet',
  'betfair',
  'unibet',
  'betvictor',
  'matchbook'
];

export const EXCHANGES = ['betfair', 'matchbook'];

export interface Outcome {
  bookmaker: string;
  price: number;
  label: string;
  link?: string;
}

export interface SureBet {
  id: string;
  sport: Sport;
  event: string;
  commenceTime: string;
  profitPercentage: number;
  lastUpdated: string;
  outcomes: Outcome[];
  discoveryDate?: string;
  isExpired?: boolean;
}

export interface SiteSettings {
  appName: string;
  version: string;
  isScraperActive: boolean;
  globalCommission: number;
  alertThreshold: number;
  lastScrapeTime?: string;
  scrapeCount?: number;
}

export interface OddsAPIResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

export const decimalToFractional = (decimal: number): string => {
  const fractional = decimal - 1;
  const tolerance = 1.0e-6;
  let numerator = 1;
  let denominator = 1;
  let error = Math.abs(fractional - numerator / denominator);

  while (error > tolerance && denominator < 1000) {
    if (fractional > numerator / denominator) {
      numerator++;
    } else {
      denominator++;
      numerator = Math.round(fractional * denominator);
    }
    error = Math.abs(fractional - numerator / denominator);
  }

  return `${numerator}/${denominator}`;
};

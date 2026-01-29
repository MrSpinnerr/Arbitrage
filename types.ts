
export interface Odds {
  bookmaker: string;
  price: number;
  label: string;
  link?: string;
}

export type OddsFormat = 'decimal' | 'fractional';

export interface SiteSettings {
  appName: string;
  version: string;
  isScraperActive: boolean;
  globalCommission: number;
  alertThreshold: number;
}

export interface SureBet {
  id: string;
  sport: string;
  event: string;
  commenceTime: string;
  profitPercentage: number;
  outcomes: Odds[];
  lastUpdated: string;
  discoveryDate?: string;
  isManual?: boolean;
}

export enum Sport {
  FOOTBALL = 'Football',
  TENNIS = 'Tennis',
  BASKETBALL = 'Basketball',
  HORSE_RACING = 'Horse Racing',
  CRICKET = 'Cricket',
  RUGBY = 'Rugby',
  GOLF = 'Golf',
  BOXING = 'Boxing',
  DARTS = 'Darts',
  ESPORTS = 'E-Sports'
}

export const UK_BOOKMAKERS = [
  'Bet365', 'William Hill', 'Paddy Power', 'SkyBet', 
  'Ladbrokes', 'Betfair', 'Smarkets', 'Matchbook', 
  'Unibet', '888Sport', 'Coral', 'Betfred'
];

export const EXCHANGES = ['Betfair', 'Smarkets', 'Matchbook'];

export const decimalToFractional = (decimal: number): string => {
  if (decimal <= 1) return "0/1";
  let numerator = Math.round((decimal - 1) * 100);
  let denominator = 100;
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const common = gcd(numerator, denominator);
  return `${numerator/common}/${denominator/common}`;
};

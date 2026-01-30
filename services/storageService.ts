import { SureBet, SiteSettings } from '../types';

const HISTORY_KEY = 'arbitra_history_v2';
const MARKET_DB_KEY = 'arbitra_market_db_v2';
const LAST_SYNC_KEY = 'arbitra_last_sync_v2';
const SETTINGS_KEY = 'arbitra_settings_v2';

const DEFAULT_SETTINGS: SiteSettings = {
  appName: 'ARBITRA',
  version: 'v2.5 Professional',
  isScraperActive: true,
  globalCommission: 2.0,
  alertThreshold: 3.5,
  scrapeCount: 0
};

export const getSiteSettings = (): SiteSettings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
};

export const saveSiteSettings = (settings: SiteSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const saveToHistory = (newBets: SureBet[]) => {
  const existingRaw = localStorage.getItem(HISTORY_KEY);
  let history: SureBet[] = existingRaw ? JSON.parse(existingRaw) : [];
  
  const timestampedBets = newBets.map(bet => ({
    ...bet,
    discoveryDate: bet.discoveryDate || new Date().toISOString()
  }));

  // Merge new bets with existing history (avoid duplicates)
  const uniqueHistory = [...timestampedBets, ...history].filter(
    (bet, index, self) => index === self.findIndex((b) => b.id === bet.id && b.discoveryDate === bet.discoveryDate)
  );

  // Remove history older than 1 year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const recentHistory = uniqueHistory.filter(bet => {
    const discoveryDate = new Date(bet.discoveryDate || bet.lastUpdated);
    return discoveryDate > oneYearAgo;
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(recentHistory));
};

export const getHistoryByMonth = (): Record<string, SureBet[]> => {
  const raw = localStorage.getItem(HISTORY_KEY);
  const history: SureBet[] = raw ? JSON.parse(raw) : [];
  
  const historyByMonth: Record<string, SureBet[]> = {};
  
  history.forEach(bet => {
    const date = new Date(bet.discoveryDate || bet.lastUpdated);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!historyByMonth[monthKey]) {
      historyByMonth[monthKey] = [];
    }
    
    historyByMonth[monthKey].push(bet);
  });
  
  // Sort months in descending order (newest first)
  const sortedHistory: Record<string, SureBet[]> = {};
  Object.keys(historyByMonth)
    .sort((a, b) => b.localeCompare(a))
    .forEach(key => {
      sortedHistory[key] = historyByMonth[key];
    });
  
  return sortedHistory;
};

export const updateMarketDatabase = (bets: SureBet[]) => {
  // Only keep active (non-expired) bets in the market database
  const activeBets = bets.filter(bet => !bet.isExpired);
  
  localStorage.setItem(MARKET_DB_KEY, JSON.stringify(activeBets));
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
};

export const deleteBetFromDB = (id: string) => {
  const bets = getMarketDatabase();
  const filtered = bets.filter(b => b.id !== id);
  updateMarketDatabase(filtered);
};

export const getMarketDatabase = (): SureBet[] => {
  const raw = localStorage.getItem(MARKET_DB_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const getLastSyncTime = (): Date | null => {
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  return raw ? new Date(raw) : null;
};

export const getHistory = (): SureBet[] => {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(MARKET_DB_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
};

export const getMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

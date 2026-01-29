
import { SureBet, SiteSettings } from '../types';

const HISTORY_KEY = 'arbitra_history_v1';
const MARKET_DB_KEY = 'arbitra_market_db_v1';
const LAST_SYNC_KEY = 'arbitra_last_sync_v1';
const SETTINGS_KEY = 'arbitra_settings_v1';

const DEFAULT_SETTINGS: SiteSettings = {
  appName: 'ARBITRA',
  version: 'v2.5 Professional',
  isScraperActive: true,
  globalCommission: 2.0,
  alertThreshold: 3.5
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
    discoveryDate: new Date().toISOString()
  }));

  const uniqueHistory = [...timestampedBets, ...history].filter(
    (bet, index, self) => index === self.findIndex((b) => b.id === bet.id)
  );

  localStorage.setItem(HISTORY_KEY, JSON.stringify(uniqueHistory.slice(0, 100)));
};

export const updateMarketDatabase = (bets: SureBet[]) => {
  localStorage.setItem(MARKET_DB_KEY, JSON.stringify(bets));
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

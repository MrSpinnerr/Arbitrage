import { fetchOddsFromAPI } from './oddsApiService';
import { updateMarketDatabase, saveToHistory, getSiteSettings, saveSiteSettings, getMarketDatabase } from './storageService';
import { Sport, SureBet } from '../types';

const SCRAPE_INTERVAL_MS = 88 * 60 * 1000; // 88 minutes (just under 1.5 hours)
let scrapeInterval: NodeJS.Timeout | null = null;

export const startAutoScraper = () => {
  console.log("[Scraper] Auto-scraper starting...");
  
  // Run immediately on start
  runDeepScrape();
  
  // Then run every 88 minutes
  if (scrapeInterval) {
    clearInterval(scrapeInterval);
  }
  
  scrapeInterval = setInterval(() => {
    runDeepScrape();
  }, SCRAPE_INTERVAL_MS);
};

export const stopAutoScraper = () => {
  if (scrapeInterval) {
    clearInterval(scrapeInterval);
    scrapeInterval = null;
    console.log("[Scraper] Auto-scraper stopped.");
  }
};

export const runDeepScrape = async (): Promise<SureBet[]> => {
  console.log("[Scraper] Starting deep market crawl...");
  
  const settings = getSiteSettings();
  
  // Check if scraper is active
  if (!settings.isScraperActive) {
    console.log("[Scraper] Scraper is disabled in settings.");
    return [];
  }
  
  // All sports to scrape
  const sportsToScrape = [Sport.FOOTBALL, Sport.TENNIS, Sport.HORSE_RACING];
  
  try {
    // Fetch real odds from API
    const freshData = await fetchOddsFromAPI(sportsToScrape);
    
    console.log(`[Scraper] Found ${freshData.length} arbitrage opportunities`);
    
    // Get existing data
    const existingData = getMarketDatabase();
    
    // Merge new data with existing (remove duplicates by ID)
    const mergedData = [...freshData];
    
    existingData.forEach(existingBet => {
      if (!freshData.find(newBet => newBet.id === existingBet.id)) {
        // Check if event has expired (game time passed)
        const eventTime = new Date(existingBet.commenceTime);
        const now = new Date();
        
        if (eventTime > now) {
          // Event hasn't started yet, keep it
          mergedData.push(existingBet);
        } else {
          // Event has passed, mark as expired and move to history
          existingBet.isExpired = true;
          saveToHistory([existingBet]);
        }
      }
    });
    
    // Update the "Database File"
    updateMarketDatabase(mergedData);
    
    // Save new opportunities to history
    if (freshData.length > 0) {
      saveToHistory(freshData);
    }
    
    // Update scrape count and last scrape time
    const newSettings = {
      ...settings,
      lastScrapeTime: new Date().toISOString(),
      scrapeCount: (settings.scrapeCount || 0) + 1
    };
    saveSiteSettings(newSettings);
    
    console.log(`[Scraper] Scrape complete. ${mergedData.length} opportunities in DB.`);
    console.log(`[Scraper] Total scrapes this month: ${newSettings.scrapeCount}`);
    
    return mergedData;
  } catch (error) {
    console.error("[Scraper] Database update failed:", error);
    throw error;
  }
};

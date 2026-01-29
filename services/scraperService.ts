
import { findSureBets } from './geminiService';
import { updateMarketDatabase, saveToHistory } from './storageService';
import { Sport } from '../types';

export const runDeepScrape = async (excludedBookmakers: string[]) => {
  console.log("[Scraper] Starting deep market crawl...");
  
  // Scrape all major sports to populate the database fully
  const allSports = Object.values(Sport);
  
  try {
    const freshData = await findSureBets(allSports, excludedBookmakers);
    
    // Update the "Database File"
    updateMarketDatabase(freshData);
    
    // Log to audit history
    if (freshData.length > 0) {
      saveToHistory(freshData);
    }
    
    console.log(`[Scraper] Scrape complete. ${freshData.length} opportunities synced to DB.`);
    return freshData;
  } catch (error) {
    console.error("[Scraper] Database update failed:", error);
    throw error;
  }
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SureBet, Sport, OddsFormat, SiteSettings } from './types';
import { startAutoScraper, stopAutoScraper } from './services/scraperService';
import { getHistoryByMonth, getMarketDatabase, getLastSyncTime, getSiteSettings, saveSiteSettings, getMonthName } from './services/storageService';
import Sidebar from './components/Sidebar';
import BetCard from './components/BetCard';
import AdminCMS from './components/AdminCMS';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'admin'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bets, setBets] = useState<SureBet[]>([]);
  const [historyByMonth, setHistoryByMonth] = useState<Record<string, SureBet[]>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>('decimal');
  const [excludedBookmakers, setExcludedBookmakers] = useState<string[]>([]);
  const [exchangeCommission, setExchangeCommission] = useState<number>(siteSettings.globalCommission);

  useEffect(() => {
    setExchangeCommission(siteSettings.globalCommission);
  }, [siteSettings]);

  const syncFromDB = useCallback(() => {
    const dbBets = getMarketDatabase();
    const filtered = dbBets.filter(bet => 
      (selectedSports.length === 0 || selectedSports.includes(bet.sport as Sport))
    );
    setBets(filtered);
    
    const monthlyHistory = getHistoryByMonth();
    setHistoryByMonth(monthlyHistory);
    
    // Set first month as selected by default
    const months = Object.keys(monthlyHistory);
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
    
    setLastSync(getLastSyncTime());
  }, [selectedSports, selectedMonth]);

  // Start auto-scraper on component mount
  useEffect(() => {
    syncFromDB();
    
    if (siteSettings.isScraperActive) {
      startAutoScraper();
    }

    // Refresh UI every 30 seconds to update display
    const uiInterval = setInterval(() => {
      syncFromDB();
    }, 30000);

    return () => {
      clearInterval(uiInterval);
      stopAutoScraper();
    };
  }, [siteSettings.isScraperActive, syncFromDB]);

  const toggleSport = (sport: Sport) => {
    setSelectedSports(prev => 
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const toggleBookmaker = (bookie: string) => {
    setExcludedBookmakers(prev => 
      prev.includes(bookie) ? prev.filter(b => b !== bookie) : [...prev, bookie]
    );
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    saveSiteSettings(newSettings);
    
    // Restart auto-scraper if settings changed
    if (newSettings.isScraperActive) {
      startAutoScraper();
    } else {
      stopAutoScraper();
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get('user') === 'admin' && fd.get('pass') === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert("Unauthorized Access. Credentials invalid.");
    }
  };

  const timeSinceSync = useMemo(() => {
    if (!lastSync) return "Never";
    const diff = Math.floor((new Date().getTime() - lastSync.getTime()) / 60000);
    return diff === 0 ? "Just now" : `${diff}m ago`;
  }, [lastSync, bets]);

  const nextScrapeTime = useMemo(() => {
    if (!lastSync || !siteSettings.isScraperActive) return "Scraper disabled";
    const nextScrape = new Date(lastSync.getTime() + 88 * 60 * 1000);
    const diff = Math.floor((nextScrape.getTime() - new Date().getTime()) / 60000);
    if (diff <= 0) return "Running now...";
    return `${diff}m`;
  }, [lastSync, siteSettings.isScraperActive]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSports={selectedSports} 
        toggleSport={toggleSport} 
        oddsFormat={oddsFormat}
        setOddsFormat={setOddsFormat}
        excludedBookmakers={excludedBookmakers}
        toggleBookmaker={toggleBookmaker}
        siteSettings={siteSettings}
        nextScrapeTime={nextScrapeTime}
      />

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        {activeTab === 'admin' ? (
          !isAuthenticated ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-md bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <h1 className="text-2xl font-black text-white">Secure CMS Login</h1>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-2">Restricted Access Portal</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Username</label>
                    <input name="user" className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-bold" placeholder="admin" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Access Token</label>
                    <input name="pass" type="password" className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-bold" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest text-xs">Verify & Enter</button>
                </form>
              </div>
            </div>
          ) : (
            <AdminCMS 
              settings={siteSettings} 
              onUpdateSettings={handleUpdateSettings} 
              onLogout={() => setIsAuthenticated(false)} 
            />
          )
        ) : activeTab === 'dashboard' ? (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Market Feed</h2>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                    siteSettings.isScraperActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {siteSettings.isScraperActive ? 'Auto-Scraper Active' : 'Scraper Disabled'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white">Live UK Scanner</span>
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Last: <span className="text-blue-400">{timeSinceSync}</span></span>
                    <span className="text-slate-700">•</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Next: <span className="text-emerald-400">{nextScrapeTime}</span></span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-sm">
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Exchange Comm.</div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" min="0" max="5" step="0.5" 
                      value={exchangeCommission} 
                      onChange={(e) => setExchangeCommission(Number(e.target.value))}
                      className="w-24 accent-emerald-500"
                    />
                    <span className="text-xs font-black text-white">{exchangeCommission}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 group hover:border-emerald-500/30 transition-all">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Opportunities</div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-white leading-none">{bets.length}</span>
                </div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 group hover:border-orange-500/30 transition-all">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Max Yield</div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-orange-500 leading-none">
                    {bets.length > 0 ? Math.max(...bets.map(b => b.profitPercentage)).toFixed(1) : '0'}
                  </span>
                  <span className="text-2xl font-black text-slate-500 mb-2">%</span>
                </div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 group hover:border-blue-500/30 transition-all">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">API Scrapes</div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black text-white leading-none">{siteSettings.scrapeCount || 0}</span>
                  <span className="text-lg font-black text-slate-500 mb-3">/500</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pb-10">
              {bets.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    {siteSettings.isScraperActive ? 'Scanning markets... Check back in a few minutes.' : 'Auto-scraper is disabled. Enable in CMS.'}
                  </p>
                </div>
              )}
              {bets.map((bet) => (
                <BetCard 
                  key={bet.id} 
                  bet={bet} 
                  oddsFormat={oddsFormat} 
                  exchangeCommission={exchangeCommission}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-black text-white mt-1 mb-8 tracking-tight">Historical Opportunities</h1>
            
            {/* Month Tabs */}
            {Object.keys(historyByMonth).length > 0 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {Object.keys(historyByMonth).map(monthKey => (
                  <button
                    key={monthKey}
                    onClick={() => setSelectedMonth(monthKey)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                      selectedMonth === monthKey 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {getMonthName(monthKey)}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {!selectedMonth || !historyByMonth[selectedMonth] || historyByMonth[selectedMonth].length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No historical data for this period</p>
                </div>
              ) : (
                historyByMonth[selectedMonth].map((bet, i) => (
                  <div key={bet.id + i} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                          bet.profitPercentage > siteSettings.alertThreshold ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>{bet.sport}</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          {new Date(bet.discoveryDate || bet.lastUpdated).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">{bet.event}</h3>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800 min-w-[140px]">
                      <div className={`text-3xl font-black ${bet.profitPercentage > siteSettings.alertThreshold ? 'text-orange-500' : 'text-emerald-500'}`}>
                        +{bet.profitPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

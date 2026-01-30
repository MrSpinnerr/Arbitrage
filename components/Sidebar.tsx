import React from 'react';
import { Sport, OddsFormat, UK_BOOKMAKERS, SiteSettings } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'history' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'history' | 'admin') => void;
  selectedSports: Sport[];
  toggleSport: (sport: Sport) => void;
  oddsFormat: OddsFormat;
  setOddsFormat: (f: OddsFormat) => void;
  excludedBookmakers: string[];
  toggleBookmaker: (b: string) => void;
  siteSettings: SiteSettings;
  nextScrapeTime: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, selectedSports, toggleSport, 
  oddsFormat, setOddsFormat,
  excludedBookmakers, toggleBookmaker, siteSettings, nextScrapeTime
}) => {
  const sports = [Sport.FOOTBALL, Sport.TENNIS, Sport.HORSE_RACING];

  return (
    <aside className="w-full lg:w-80 bg-slate-950 text-white lg:min-h-screen p-6 flex flex-col border-r border-slate-900 sticky top-0 h-fit lg:h-screen z-40">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">{siteSettings.appName}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{siteSettings.version}</p>
        </div>
      </div>

      <nav className="space-y-1 mb-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          History
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-400 hover:bg-slate-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          CMS Portal
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
        {activeTab !== 'admin' && (
          <>
            <div>
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">UI Config</h2>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                <button 
                  onClick={() => setOddsFormat('decimal')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${oddsFormat === 'decimal' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Decimal
                </button>
                <button 
                  onClick={() => setOddsFormat('fractional')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${oddsFormat === 'fractional' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Fractional
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Bookmaker Access</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {UK_BOOKMAKERS.map((bookie) => (
                  <button
                    key={bookie}
                    onClick={() => toggleBookmaker(bookie)}
                    className={`px-2 py-2 rounded-lg text-[9px] font-bold border transition-all truncate text-center ${
                      !excludedBookmakers.includes(bookie)
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-slate-900 text-slate-600 border-transparent grayscale'
                    }`}
                  >
                    {bookie}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Sports Filter</h2>
              <div className="space-y-1">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 group border text-xs ${
                      selectedSports.includes(sport)
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900 border-transparent'
                    }`}
                  >
                    <span className="font-bold">{sport}</span>
                    {selectedSports.includes(sport) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-900">
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">Auto-Scraper</span>
            <div className={`w-2 h-2 rounded-full ${siteSettings.isScraperActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`}></div>
          </div>
          <div className="text-xs font-bold text-slate-400">
            {siteSettings.isScraperActive ? (
              <>Next scan in: <span className="text-emerald-400">{nextScrapeTime}</span></>
            ) : (
              <span className="text-red-400">Disabled (Enable in CMS)</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase">API Usage</span>
              <span className="text-xs font-bold text-white">{siteSettings.scrapeCount || 0}/500</span>
            </div>
            <div className="mt-2 w-full bg-slate-950 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${((siteSettings.scrapeCount || 0) / 500) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

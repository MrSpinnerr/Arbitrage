
import React from 'react';
import { Sport, OddsFormat, UK_BOOKMAKERS, SiteSettings } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'history' | 'admin';
  setActiveTab: (tab: 'dashboard' | 'history' | 'admin') => void;
  selectedSports: Sport[];
  toggleSport: (sport: Sport) => void;
  isAnalyzing: boolean;
  onRefresh: () => void;
  oddsFormat: OddsFormat;
  setOddsFormat: (f: OddsFormat) => void;
  excludedBookmakers: string[];
  toggleBookmaker: (b: string) => void;
  siteSettings: SiteSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, selectedSports, toggleSport, 
  isAnalyzing, onRefresh, oddsFormat, setOddsFormat,
  excludedBookmakers, toggleBookmaker, siteSettings
}) => {
  const sports = Object.values(Sport);

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
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Sports Feed</h2>
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
        <button
          onClick={onRefresh}
          disabled={isAnalyzing || !siteSettings.isScraperActive}
          className="w-full bg-slate-100 hover:bg-white disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          {!siteSettings.isScraperActive ? (
            <span className="text-[10px] text-red-500 font-black uppercase">Scraper Offline</span>
          ) : isAnalyzing ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>RUN SCANNER</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

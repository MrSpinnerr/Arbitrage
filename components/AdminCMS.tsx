
import React, { useState, useRef } from 'react';
import { SureBet, SiteSettings } from '../types';
import { getMarketDatabase, deleteBetFromDB, updateMarketDatabase } from '../services/storageService';

interface AdminCMSProps {
  settings: SiteSettings;
  onUpdateSettings: (s: SiteSettings) => void;
  onLogout: () => void;
}

const AdminCMS: React.FC<AdminCMSProps> = ({ settings, onUpdateSettings, onLogout }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [dbEntries, setDbEntries] = useState<SureBet[]>(getMarketDatabase());
  const [activeTab, setActiveTab] = useState<'config' | 'database'>('config');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    alert("System settings synchronized.");
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Permanently delete this market record?")) {
      deleteBetFromDB(id);
      setDbEntries(getMarketDatabase());
    }
  };

  const exportDatabase = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbEntries));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `arbitra_db_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        updateMarketDatabase(json);
        setDbEntries(json);
        alert("Database File successfully restored.");
      } catch (err) {
        alert("Invalid Database File format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-900">
        <div>
          <h2 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">PRO Management Layer</h2>
          <h1 className="text-3xl font-black text-white">System CMS</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportDatabase}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export DB
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Import DB
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={importDatabase} />
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 rounded-xl text-white text-xs font-black hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
          >
            EXIT CMS
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('config')}
          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'config' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
          }`}
        >
          General Settings
        </button>
        <button 
          onClick={() => setActiveTab('database')}
          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'database' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-900 text-slate-500 border border-slate-800'
          }`}
        >
          Database Explorer
        </button>
      </div>

      {activeTab === 'config' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-white font-black text-lg mb-6">Identity & Branding</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Platform Name</label>
                <input 
                  value={localSettings.appName}
                  onChange={(e) => setLocalSettings({...localSettings, appName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Software Version</label>
                <input 
                  value={localSettings.version}
                  onChange={(e) => setLocalSettings({...localSettings, version: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-white font-black text-lg mb-6">Automation Controls</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <div className="text-sm font-black text-white">Deep Scraper Program</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Background Worker: {localSettings.isScraperActive ? 'RUNNING' : 'DISABLED'}</div>
                </div>
                <button 
                  onClick={() => setLocalSettings({...localSettings, isScraperActive: !localSettings.isScraperActive})}
                  className={`w-14 h-8 rounded-full relative transition-all ${localSettings.isScraperActive ? 'bg-emerald-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${localSettings.isScraperActive ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Default Commission (%)</label>
                <input 
                  type="number"
                  value={localSettings.globalCommission}
                  onChange={(e) => setLocalSettings({...localSettings, globalCommission: Number(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-white font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 pt-6">
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-sm"
            >
              Commit System Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Market DB Records ({dbEntries.length})</h3>
            <button 
               onClick={() => setDbEntries([])} 
               className="text-[10px] font-black text-red-500 uppercase hover:underline"
            >
              Purge All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Sport</th>
                  <th className="px-6 py-4">Yield</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dbEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-600 font-bold uppercase text-xs">No records in database file</td>
                  </tr>
                ) : (
                  dbEntries.map((bet) => (
                    <tr key={bet.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="text-sm font-black text-white">{bet.event}</div>
                        <div className="text-[9px] text-slate-500 font-bold mt-0.5">{bet.id}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-blue-400 border border-blue-400/20 px-2 py-1 rounded bg-blue-400/5">{bet.sport}</span>
                      </td>
                      <td className="px-6 py-5 font-black text-emerald-400">+{bet.profitPercentage.toFixed(2)}%</td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => handleDeleteEntry(bet.id)}
                          className="text-slate-600 hover:text-red-500 transition-all p-2 bg-slate-950 rounded-lg group-hover:border-red-500/20 border border-transparent"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCMS;

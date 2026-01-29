
import React, { useState, useMemo } from 'react';
import { SureBet, OddsFormat, EXCHANGES, decimalToFractional } from '../types';

interface BetCardProps {
  bet: SureBet;
  oddsFormat: OddsFormat;
  exchangeCommission: number;
}

const BetCard: React.FC<BetCardProps> = ({ bet, oddsFormat, exchangeCommission }) => {
  const [totalStake, setTotalStake] = useState<number>(100);
  const [useRounding, setUseRounding] = useState<boolean>(true);
  
  const isHot = bet.profitPercentage > 3.5;

  const calculations = useMemo(() => {
    // Math always uses decimal for calculation
    const totalInverse = bet.outcomes.reduce((acc, outcome) => {
      let price = outcome.price;
      // Adjust price if it's an exchange
      if (EXCHANGES.includes(outcome.bookmaker)) {
        // Effective odds after commission: 1 + (Price - 1) * (1 - Comm)
        price = 1 + (outcome.price - 1) * (1 - exchangeCommission / 100);
      }
      return acc + (1 / price);
    }, 0);
    
    const rawStakes = bet.outcomes.map(outcome => {
      let price = outcome.price;
      if (EXCHANGES.includes(outcome.bookmaker)) {
        price = 1 + (outcome.price - 1) * (1 - exchangeCommission / 100);
      }
      
      let stake = (totalStake / (price * totalInverse));
      if (useRounding) stake = Math.round(stake);
      
      const potentialReturn = stake * price;
      
      return {
        ...outcome,
        stake,
        return: potentialReturn,
        displayOdds: oddsFormat === 'decimal' ? outcome.price.toFixed(2) : decimalToFractional(outcome.price)
      };
    });

    const actualTotalStake = rawStakes.reduce((acc, curr) => acc + curr.stake, 0);
    const minReturn = Math.min(...rawStakes.map(s => s.return));
    const profitAmount = minReturn - actualTotalStake;
    const profitPerc = (profitAmount / actualTotalStake) * 100;

    return { profitPerc, stakes: rawStakes, actualTotalStake, profitAmount };
  }, [bet, totalStake, useRounding, oddsFormat, exchangeCommission]);

  return (
    <div className={`bg-slate-900 rounded-2xl shadow-xl border transition-all duration-300 relative overflow-hidden ${
      isHot ? 'border-orange-500/50 shadow-orange-950/20 ring-1 ring-orange-500/20' : 'border-slate-800'
    }`}>
      {isHot && (
        <div className="absolute top-0 right-0 bg-orange-600 px-4 py-1 rounded-bl-xl flex items-center gap-2 z-10 animate-pulse">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">Hot Arb</span>
          <span className="text-sm">🔥</span>
        </div>
      )}

      <div className={`p-5 border-b flex justify-between items-center ${
        isHot ? 'bg-orange-500/5 border-orange-500/20' : 'bg-slate-900/50 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
              {bet.sport}
            </span>
            {EXCHANGES.some(e => bet.outcomes.some(o => o.bookmaker === e)) && (
              <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Exchange Incl.</span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-100 mt-2">{bet.event}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
            Starts: {new Date(bet.commenceTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • UK Market
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black ${isHot ? 'text-orange-500' : 'text-emerald-400'}`}>
            +{calculations.profitPerc.toFixed(2)}%
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase">Yield</div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Capitalize On (£)</label>
            <input 
              type="number" 
              value={totalStake} 
              onChange={(e) => setTotalStake(Number(e.target.value))}
              className="px-4 py-2 w-full bg-slate-800 border border-slate-700 rounded-lg text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2 h-full self-end pb-1">
            <button 
              onClick={() => setUseRounding(!useRounding)}
              className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                useRounding 
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              Detect Avoidance: {useRounding ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculations.stakes.map((outcome, idx) => (
            <div key={idx} className="relative p-4 bg-slate-800/40 rounded-xl border border-slate-800 hover:bg-slate-800/60 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{outcome.label}</span>
                <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{outcome.bookmaker}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-700">
                  <span className="text-xl font-black text-white">{outcome.displayOdds}</span>
                  {EXCHANGES.includes(outcome.bookmaker) && (
                    <span className="text-[8px] block text-slate-500 uppercase -mt-1">Net of {exchangeCommission}%</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Place Stake</span>
                  <span className="text-2xl font-black text-emerald-400">£{outcome.stake}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-5 rounded-2xl flex items-center justify-between shadow-inner ${
          isHot ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase opacity-80 tracking-[0.1em]">Total Net Extraction</span>
            <div className="text-3xl font-black">£{calculations.profitAmount.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase opacity-80 tracking-[0.1em]">ROI Guaranteed</span>
            <div className="text-xl font-black">{calculations.profitPerc.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetCard;

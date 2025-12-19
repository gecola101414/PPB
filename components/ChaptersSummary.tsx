
import React, { useMemo } from 'react';
import { FundingIDV, WorkOrder, ChapterStats, WorkStatus } from '../types';

interface ChaptersSummaryProps {
  idvs: FundingIDV[];
  orders: WorkOrder[];
  onChapterClick: (chapter: string) => void;
}

export const getChapterColor = (chapter: string) => {
  const colors = [
    'indigo', 'emerald', 'amber', 'rose', 'cyan', 
    'violet', 'orange', 'blue', 'teal', 'fuchsia'
  ];
  let hash = 0;
  for (let i = 0; i < chapter.length; i++) {
    hash = chapter.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const ChaptersSummary: React.FC<ChaptersSummaryProps> = ({ idvs, orders, onChapterClick }) => {
  
  const statsByChapter = useMemo(() => {
    const stats: Record<string, ChapterStats> = {};
    
    // Inizializza i capitoli dai fondi
    idvs.forEach(idv => {
      const cap = idv.capitolo;
      if (!stats[cap]) {
        stats[cap] = { capitolo: cap, totalBudget: 0, committed: 0, contracted: 0, spent: 0, available: 0 };
      }
      stats[cap].totalBudget += idv.amount;
    });

    // Calcola l'impegnato reale per ogni capitolo
    orders.forEach(o => {
      // Trova a quale capitolo appartiene questa pratica guardando i suoi IDV collegati
      const linkedIdv = idvs.find(i => o.linkedIdvIds.includes(i.id));
      if (linkedIdv) {
        const cap = linkedIdv.capitolo;
        if (stats[cap]) {
          // Il valore impegnato è il valore più recente della pratica
          const currentVal = o.paidValue || o.contractValue || o.estimatedValue;
          stats[cap].committed += currentVal;
        }
      }
    });

    // Calcola il residuo (Previsto Impegno)
    Object.keys(stats).forEach(cap => {
      stats[cap].available = stats[cap].totalBudget - stats[cap].committed;
    });

    return Object.values(stats).sort((a, b) => a.capitolo.localeCompare(b.capitolo));
  }, [idvs, orders]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Riepilogo Stato Capitoli</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Bilancio Integrato: Assegnazione vs Impegni Reali</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {statsByChapter.map((c) => {
          const percUsed = (c.committed / c.totalBudget) * 100;
          const color = getChapterColor(c.capitolo);
          
          return (
            <div 
              key={c.capitolo}
              className={`bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col lg:flex-row items-center gap-10`}
            >
              {/* Box Capitolo Cliccabile */}
              <button 
                onClick={() => onChapterClick(c.capitolo)}
                className={`flex flex-col items-center justify-center text-white w-24 h-24 rounded-3xl shadow-xl flex-shrink-0 transition-all hover:scale-110 active:scale-95 bg-${color}-600 ring-4 ring-transparent hover:ring-${color}-200`}
              >
                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Cap.</span>
                <span className="text-2xl font-black">{c.capitolo}</span>
              </button>

              {/* Dati Finanziari con Titoli Interattivi */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assegnazione (Fondi)</span>
                  <span className="text-2xl font-black text-slate-900">€{c.totalBudget.toLocaleString()}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impegnato (Lavori)</span>
                  <span className={`text-2xl font-black text-${color}-600`}>€{c.committed.toLocaleString()}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Residuo (Previsto Impegno)</span>
                  <span className={`text-2xl font-black ${c.available < 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`}>
                    €{c.available.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Dettaglio */}
              <div className="w-full lg:w-64 flex flex-col gap-4">
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-1000 ${percUsed > 100 ? 'bg-rose-500' : percUsed > 85 ? 'bg-amber-500' : `bg-${color}-500`}`}
                    style={{ width: `${Math.min(percUsed, 100)}%` }}
                  ></div>
                </div>
                <button 
                  onClick={() => onChapterClick(c.capitolo)}
                  className={`w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-${color}-600 hover:text-white hover:border-${color}-600 transition-all flex items-center justify-center gap-2`}
                >
                  Vedi Dettaglio Analitico
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          );
        })}

        {statsByChapter.length === 0 && (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-black uppercase tracking-widest">Nessun capitolo registrato nel sistema</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChaptersSummary;

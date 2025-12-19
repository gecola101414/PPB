
import React, { useMemo, useState } from 'react';
import { FundingIDV, WorkOrder, WorkStatus, ChapterStats } from '../types';
import { calculateAllResiduals } from './WorkForm';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
// @ts-ignore
import pptxgen from 'pptxgenjs';
import { getChapterColor } from './ChaptersSummary';

interface DashboardProps {
  idvs: FundingIDV[];
  orders: WorkOrder[];
  onChapterClick: (chapter: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ idvs, orders, onChapterClick }) => {
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);

  const statsByChapter = useMemo(() => {
    const stats: Record<string, ChapterStats> = {};
    
    // Assegnazione
    idvs.forEach(idv => {
      const cap = idv.capitolo;
      if (!stats[cap]) {
        stats[cap] = { capitolo: cap, totalBudget: 0, committed: 0, contracted: 0, spent: 0, available: 0 };
      }
      stats[cap].totalBudget += idv.amount;
    });

    // Impegnato
    orders.forEach(o => {
      const linkedIdv = idvs.find(i => o.linkedIdvIds.includes(i.id));
      if (linkedIdv && stats[linkedIdv.capitolo]) {
        const cap = linkedIdv.capitolo;
        if (o.status === WorkStatus.PROGETTO) stats[cap].committed += o.estimatedValue;
        if (o.status === WorkStatus.AFFIDAMENTO) stats[cap].contracted += (o.contractValue || 0);
        if (o.status === WorkStatus.PAGAMENTO) stats[cap].spent += (o.paidValue || 0);
      }
    });

    // Residuo
    Object.keys(stats).forEach(cap => {
      const consumption = stats[cap].spent || stats[cap].contracted || stats[cap].committed;
      stats[cap].available = stats[cap].totalBudget - consumption;
    });

    return Object.values(stats);
  }, [idvs, orders]);

  const globalData = useMemo(() => {
    const total = idvs.reduce((a, b) => a + b.amount, 0);
    const committed = orders.reduce((a, b) => a + (b.status === WorkStatus.PROGETTO ? b.estimatedValue : 0), 0);
    const contracted = orders.reduce((a, b) => a + (b.status === WorkStatus.AFFIDAMENTO ? b.contractValue || 0 : 0), 0);
    const spent = orders.reduce((a, b) => a + (b.status === WorkStatus.PAGAMENTO ? b.paidValue || 0 : 0), 0);
    
    return [
      { name: 'Assegnato', valore: total, color: '#0f172a' },
      { name: 'Impegnato', valore: total - (total - (committed+contracted+spent)), color: '#f59e0b' }, // Visualizziamo il consumo totale
      { name: 'Liquidato', valore: spent, color: '#10b981' }
    ];
  }, [idvs, orders]);

  const efficiencyIndex = useMemo(() => {
    const totalBudget = idvs.reduce((a, b) => a + b.amount, 0);
    const totalSpent = orders.reduce((a, b) => a + (b.paidValue || 0), 0);
    if (totalBudget === 0) return 100;
    return Math.round((totalSpent / totalBudget) * 100);
  }, [idvs, orders]);

  const generatePPTX = async () => {
    setIsGeneratingPpt(true);
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';

    // 1. SLIDE DI TITOLO
    let slideTitle = pres.addSlide();
    slideTitle.background = { color: '0F172A' }; 
    slideTitle.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: '6366F1' } });
    slideTitle.addText("ESERCITO ITALIANO", { x: 0.5, y: 1.0, w: '90%', fontSize: 28, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial Black' });
    slideTitle.addText("Comando Militare Esercito Lombardia", { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: '94A3B8', align: 'center' });
    slideTitle.addText("RAPPORTO DI GESTIONE PPB", { x: 0.5, y: 3.2, w: '90%', fontSize: 54, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Arial Black', shadow: { type: 'outer', color: '000000', blur: 10, offset: 5 } });
    slideTitle.addText(`Aggiornamento al ${new Date().toLocaleDateString('it-IT')}`, { x: 0.5, y: 4.5, w: '90%', fontSize: 14, color: '6366F1', align: 'center', bold: true });

    // 2. SLIDE QUADRO ECONOMICO
    let slideGlobal = pres.addSlide();
    slideGlobal.addText("RIEPILOGO FINANZIARIO GLOBALE", { x: 0.5, y: 0.4, w: '90%', fontSize: 36, bold: true, color: '0F172A', fontFace: 'Arial Black' });
    slideGlobal.addShape(pres.ShapeType.line, { x: 0.5, y: 1.0, w: 9.0, h: 0, line: { color: '6366F1', width: 3 } });
    const totalAss = idvs.reduce((a, b) => a + b.amount, 0);
    const totalLiq = orders.reduce((a, b) => a + (b.paidValue || 0), 0);
    const metrics = [
      { label: "BUDGET TOTALE ASSEGNATO", value: `€ ${totalAss.toLocaleString()}`, color: '0F172A' },
      { label: "LIQUIDATO DEFINITIVO", value: `€ ${totalLiq.toLocaleString()}`, color: '10B981' }
    ];
    metrics.forEach((m, idx) => {
      slideGlobal.addText(m.label, { x: 0.5, y: 1.8 + (idx * 1.5), w: 4.5, fontSize: 18, bold: true, color: '64748B' });
      slideGlobal.addText(m.value, { x: 0.5, y: 2.2 + (idx * 1.5), w: 9.0, fontSize: 64, bold: true, color: m.color, fontFace: 'Arial Black' });
    });

    try {
      await pres.writeFile({ fileName: `REPORT_DIRIGENTE_PPB_${new Date().toISOString().split('T')[0]}.pptx` });
    } finally {
      setIsGeneratingPpt(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Panoramica Strategica</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sintesi Analitica del Bilancio Operativo</p>
        </div>
        
        <button 
          onClick={generatePPTX}
          disabled={isGeneratingPpt}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl transition-all active:scale-95 border-2 ${
            isGeneratingPpt 
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
              : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 hover:shadow-indigo-600/30'
          }`}
        >
          {isGeneratingPpt ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M15 13H5V9h10v4z" clipRule="evenodd" /></svg>
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isGeneratingPpt ? 'Generazione in corso...' : 'Report PPTX Dirigente'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Capacità Totale</p>
          <p className="text-3xl font-black">€{idvs.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Spesa Liquidata</p>
          <p className="text-3xl font-black text-emerald-600">€{orders.reduce((a, b) => a + (b.paidValue || 0), 0).toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Residuo Globale</p>
          <p className="text-3xl font-black text-indigo-600">€{(idvs.reduce((a, b) => a + b.amount, 0) - orders.reduce((a, b) => a + (b.paidValue || b.contractValue || b.estimatedValue), 0)).toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Efficienza Spesa</p>
            <p className="text-4xl font-black">{efficiencyIndex}%</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-indigo-500/30" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * efficiencyIndex) / 100} className="text-white transition-all duration-1000" />
            </svg>
            <span className="absolute text-[8px] font-black">KPI</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {statsByChapter.map(c => {
          const color = getChapterColor(c.capitolo);
          const capData = [
            { name: 'Assegn.', val: c.totalBudget, fill: '#0f172a' },
            { name: 'Consumo', val: c.totalBudget - c.available, fill: `var(--color-${color}-600)` }
          ];

          return (
            <div key={c.capitolo} className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group border-l-8 border-l-${color}-600`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  {/* Numero Capitolo Interattivo */}
                  <button 
                    onClick={() => onChapterClick(c.capitolo)}
                    className={`text-white text-[12px] font-black px-5 py-2 rounded-2xl uppercase shadow-lg transition-all hover:scale-110 active:scale-95 bg-${color}-600 hover:bg-${color}-700 ring-4 ring-transparent hover:ring-${color}-100 flex items-center gap-2`}
                  >
                    Capitolo {c.capitolo}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">
                    Residuo: <span className={c.available < 0 ? 'text-rose-500' : 'text-emerald-600 font-black'}>€{c.available.toLocaleString()}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Avanzamento Finanziario</span>
                </div>
              </div>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Assegnato', val: c.totalBudget, fill: '#0f172a' },
                    { name: 'Impegnato', val: c.totalBudget - c.available, fill: '#6366f1' }
                  ]} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: 900, fontSize: '10px' }}
                    />
                    <Bar dataKey="val" radius={[0, 10, 10, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

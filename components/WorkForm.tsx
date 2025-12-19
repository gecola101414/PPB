
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WorkOrder, WorkStatus, FundingIDV } from '../types';
import { VoiceInput } from './VoiceInput';

interface WorkFormProps {
  idvs: FundingIDV[];
  orders: WorkOrder[];
  existingChapters: string[];
  onSubmit: (order: Partial<WorkOrder>) => void;
  onCancel: () => void;
  initialData?: WorkOrder;
  prefilledChapter?: string;
}

export const calculateAllResiduals = (idvs: FundingIDV[], orders: WorkOrder[], excludeOrderId?: string) => {
  const currentResiduals: Record<string, number> = {};
  idvs.forEach(idv => { currentResiduals[idv.id] = idv.amount; });

  const sortedOrders = [...orders]
    .filter(o => o.id !== excludeOrderId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sortedOrders.forEach(order => {
    let costToCover = 0;
    if (order.status === WorkStatus.PAGAMENTO) costToCover = order.paidValue || 0;
    else if (order.status === WorkStatus.AFFIDAMENTO) costToCover = order.contractValue || 0;
    else costToCover = order.estimatedValue;

    (order.linkedIdvIds || []).forEach(idvId => {
      const available = currentResiduals[idvId] || 0;
      const taken = Math.min(costToCover, available);
      currentResiduals[idvId] -= taken;
      costToCover -= taken;
    });
  });

  return currentResiduals;
};

const WorkForm: React.FC<WorkFormProps> = ({ idvs = [], orders = [], existingChapters = [], onSubmit, onCancel, initialData, prefilledChapter }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedChapter, setSelectedChapter] = useState<string>(
    prefilledChapter || (initialData ? (idvs.find(i => initialData.linkedIdvIds?.includes(i.id))?.capitolo || '') : '')
  );
  
  const [formData, setFormData] = useState<Partial<WorkOrder>>(
    initialData || {
      description: '',
      estimatedValue: undefined,
      linkedIdvIds: [],
      status: WorkStatus.PROGETTO
    }
  );

  const idvResiduals = useMemo(() => calculateAllResiduals(idvs, orders, initialData?.id), [idvs, orders, initialData]);

  const filteredIdvs = useMemo(() => {
    return idvs.filter(i => i.capitolo === selectedChapter);
  }, [idvs, selectedChapter]);

  const chapterResidual = useMemo(() => {
    if (!selectedChapter) return 0;
    return idvs
      .filter(i => i.capitolo === selectedChapter)
      .reduce((sum, i) => sum + (idvResiduals[i.id] || 0), 0);
  }, [idvs, selectedChapter, idvResiduals]);

  const coverageAnalysis = useMemo(() => {
    let remainingCost = 0;
    if (formData.status === WorkStatus.PAGAMENTO) remainingCost = formData.paidValue || 0;
    else if (formData.status === WorkStatus.AFFIDAMENTO) remainingCost = formData.contractValue || 0;
    else remainingCost = formData.estimatedValue || 0;

    const plan: { idvId: string, used: number, leftover: number, wasDepleted: boolean }[] = [];
    
    (formData.linkedIdvIds || []).forEach(id => {
      const available = idvResiduals[id] || 0;
      const taken = Math.min(remainingCost, available);
      remainingCost -= taken;
      plan.push({
        idvId: id,
        used: taken,
        leftover: available - taken,
        wasDepleted: (available - taken) === 0 && taken > 0
      });
    });

    return { plan, uncovered: remainingCost };
  }, [formData.estimatedValue, formData.contractValue, formData.paidValue, formData.status, formData.linkedIdvIds, idvResiduals]);

  const toggleIdv = (id: string) => {
    const current = formData.linkedIdvIds || [];
    if (current.includes(id)) {
      setFormData({ ...formData, linkedIdvIds: current.filter(i => i !== id) });
    } else {
      setFormData({ ...formData, linkedIdvIds: [...current, id] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Il file è troppo grande. Massimo 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({
        ...formData,
        projectPdf: { name: file.name, data: base64 }
      });
    };
    reader.readAsDataURL(file);
  };

  const showContractFields = initialData && (initialData.status === WorkStatus.AFFIDAMENTO || initialData.status === WorkStatus.PAGAMENTO);

  const estimatedCost = formData.estimatedValue || 0;
  const newExpectedResidual = chapterResidual - estimatedCost;
  const isOutOfBudget = newExpectedResidual < 0;

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-50 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
            {initialData ? 'Gestione Pratica' : 'Nuova Proposta di Spesa'}
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-1">Configurazione Piano Finanziario Sequenziale</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">Contabilità FIFO Attiva</span>
        </div>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">1. Seleziona Capitolo</label>
            <select 
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                setFormData({ ...formData, linkedIdvIds: [] });
              }}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all cursor-pointer"
              required
            >
              <option value="">Scegli dal catalogo...</option>
              {existingChapters.map(c => <option key={c} value={c}>Capitolo {c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">2. Residuo Capitolo</label>
            <div className={`w-full px-5 py-4 border-2 rounded-2xl flex flex-col justify-center transition-all ${
              !selectedChapter ? 'bg-slate-50 border-slate-200' :
              isOutOfBudget ? 'bg-rose-50 border-rose-500 shadow-lg shadow-rose-100' : 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-100'
            }`}>
              <p className={`text-[10px] font-black uppercase mb-1 ${isOutOfBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isOutOfBudget ? 'Capienza Insufficiente' : 'Disponibilità Capitolo'}
              </p>
              <p className={`text-lg font-black leading-none ${isOutOfBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
                €{newExpectedResidual.toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">3. Valore Stimato (€)</label>
            <VoiceInput
              type="number"
              value={formData.estimatedValue || ''}
              onChange={(v) => setFormData({ ...formData, estimatedValue: Number(v) })}
              placeholder="es. 15000"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-600 text-lg"
            />
          </div>
        </div>

        {showContractFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 animate-in fade-in slide-in-from-top-4">
             <div>
                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Modifica Aggiudicatario</label>
                <VoiceInput
                  value={formData.winner || ''}
                  onChange={(v) => setFormData({ ...formData, winner: v })}
                  placeholder="Nome ditta..."
                  className="w-full px-5 py-4 bg-white border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
                />
             </div>
             <div>
                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Modifica Importo Contratto (€)</label>
                <VoiceInput
                  type="number"
                  value={formData.contractValue || ''}
                  onChange={(v) => setFormData({ ...formData, contractValue: Number(v) })}
                  placeholder="es. 14500"
                  className="w-full px-5 py-4 bg-white border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-700"
                />
             </div>
             {initialData?.status === WorkStatus.PAGAMENTO && (
               <div className="col-span-full">
                  <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Modifica Importo Liquidato (€)</label>
                  <VoiceInput
                    type="number"
                    value={formData.paidValue || ''}
                    onChange={(v) => setFormData({ ...formData, paidValue: Number(v) })}
                    placeholder="es. 14500"
                    className="w-full px-5 py-4 bg-white border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-emerald-700"
                  />
               </div>
             )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Descrizione Lavori</label>
            <VoiceInput
              type="textarea"
              value={formData.description || ''}
              onChange={(v) => setFormData({ ...formData, description: v })}
              placeholder="Dettaglio dell'intervento..."
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">4. Allegato Progetto Protocollato</label>
            <div className="relative group">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                id="pdf-upload"
              />
              <label 
                htmlFor="pdf-upload"
                className={`w-full h-[108px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  formData.projectPdf 
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600' 
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {formData.projectPdf ? (
                  <>
                    <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                    <span className="text-[10px] font-black uppercase text-center px-4 truncate w-full">{formData.projectPdf.name}</span>
                    <span className="text-[8px] font-bold opacity-60">Clicca per sostituire</span>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-[10px] font-black uppercase">Carica PDF Progetto</span>
                  </>
                )}
              </label>
              {formData.projectPdf && (
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, projectPdf: undefined})}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {selectedChapter && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                5. Seleziona IDV per Copertura (Cap. {selectedChapter})
              </label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {filteredIdvs.map((idv, idx) => {
                const res = idvResiduals[idv.id];
                const isSelected = formData.linkedIdvIds?.includes(idv.id);
                const order = formData.linkedIdvIds?.indexOf(idv.id);
                
                return (
                  <button
                    key={idv.id}
                    type="button"
                    disabled={res <= 0 && !isSelected}
                    onClick={() => toggleIdv(idv.id)}
                    className={`relative p-5 text-left rounded-3xl border-2 transition-all flex flex-col justify-between h-32 group ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-200/50' 
                        : res <= 0 ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50' : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                        {order! + 1}
                      </div>
                    )}
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter">{idv.idvCode}</span>
                      <span className="text-sm font-black text-slate-800">€{res.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-2 italic group-hover:text-slate-600">{idv.motivation}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100/50 flex justify-between">
                      <span className="text-[8px] font-black uppercase text-slate-400">Inserito: {new Date(idv.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.linkedIdvIds && formData.linkedIdvIds.length > 0 && (
              <div className="bg-[#0f172a] rounded-[2rem] p-8 text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32"></div>
                <h4 className="text-[10px] font-black uppercase text-slate-500 mb-8 tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  Analisi Flusso Finanziario (FIFO)
                </h4>
                <div className="space-y-6 relative">
                  {coverageAnalysis.plan.map((p, idx) => (
                    <div key={p.idvId} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{idvs.find(i => i.id === p.idvId)?.idvCode}</p>
                          <p className="text-[9px] text-slate-500 uppercase mt-0.5">Impegnato: €{p.used.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 uppercase mb-0.5">Disponibilità Futura</p>
                        <p className={`text-sm font-black ${p.leftover === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {p.leftover === 0 ? 'ESERCIZIO AZZERATO' : `€${p.leftover.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Copertura Totale</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${coverageAnalysis.uncovered > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                      <p className={`text-lg font-black ${coverageAnalysis.uncovered > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {coverageAnalysis.uncovered > 0 
                          ? `MANCANTI €${coverageAnalysis.uncovered.toLocaleString()}` 
                          : 'INTERAMENTE COPERTO'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Budget Utilizzato</p>
                    <p className="text-3xl font-black text-white">
                      €{((formData.contractValue || formData.estimatedValue || 0) - coverageAnalysis.uncovered).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-5 pt-8 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-8 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Annulla</button>
          <button 
            type="submit" 
            disabled={coverageAnalysis.uncovered > 0 || !selectedChapter}
            className={`px-12 py-4 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 ${
              coverageAnalysis.uncovered > 0 || !selectedChapter
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {initialData ? 'Applica Modifiche' : 'Salva Progetto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkForm;

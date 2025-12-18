
import React, { useState, useEffect, useMemo } from 'react';
import { WorkOrder, WorkStatus, BidResult } from './types';
import { SAMPLE_DATA, ICONS } from './constants';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import WorkForm from './components/WorkForm';
import BidModal from './components/BidModal';
import { getExpenseInsights } from './services/geminiService';

const App: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>(SAMPLE_DATA);
  const [view, setView] = useState<'dashboard' | 'catalog' | 'add' | 'edit'>('dashboard');
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [biddingOrder, setBiddingOrder] = useState<WorkOrder | null>(null);
  
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const totalEconomy = useMemo(() => 
    orders.reduce((acc, o) => acc + (o.bidResult ? o.originalValue - o.bidResult.bidValue : 0), 0)
  , [orders]);

  const handleAddOrder = (orderData: Partial<WorkOrder>) => {
    const newOrder: WorkOrder = {
      ...(orderData as Omit<WorkOrder, 'id' | 'createdAt'>),
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
    setView('catalog');
  };

  const handleUpdateOrder = (orderData: Partial<WorkOrder>) => {
    if (!editingOrder) return;
    setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...orderData } : o));
    setEditingOrder(null);
    setView('catalog');
  };

  const handleSaveBid = (bid: BidResult) => {
    if (!biddingOrder) return;
    setOrders(orders.map(o => o.id === biddingOrder.id ? { ...o, bidResult: bid, status: WorkStatus.IN_PROGRESS } : o));
    setBiddingOrder(null);
  };

  const generateInsights = async () => {
    setIsAiLoading(true);
    const insights = await getExpenseInsights(orders);
    setAiInsights(insights);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500 rounded-lg">
              <ICONS.Dashboard className="w-6 h-6" />
            </div>
            PPB
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/20' : 'text-indigo-200 hover:bg-indigo-800'}`}
          >
            <ICONS.Dashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('catalog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'catalog' ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/20' : 'text-indigo-200 hover:bg-indigo-800'}`}
          >
            <ICONS.Catalog className="w-5 h-5" />
            <span className="font-medium">Catalogo Lavori</span>
          </button>
          <button 
            onClick={() => setView('add')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'add' ? 'bg-indigo-800 text-white shadow-lg shadow-indigo-950/20' : 'text-indigo-200 hover:bg-indigo-800'}`}
          >
            <ICONS.Plus className="w-5 h-5" />
            <span className="font-medium">Nuovo Ordine</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 hidden md:block">
          <div className="p-4 bg-indigo-800/50 rounded-2xl border border-indigo-700/50">
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider mb-2">Risparmio Totale</p>
            <p className="text-2xl font-bold">€{totalEconomy.toLocaleString()}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {view === 'dashboard' && 'Cruscotto Operativo'}
              {view === 'catalog' && 'Gestione Catalogo Lavori'}
              {view === 'add' && 'Crea Nuova Voce'}
              {view === 'edit' && 'Modifica Voce'}
            </h2>
            <p className="text-sm text-gray-500">Centro controllo spese e monitoraggio progresso</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={generateInsights}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all font-medium disabled:opacity-50"
            >
              <ICONS.Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
              {isAiLoading ? 'Analisi in corso...' : 'Analisi AI'}
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {aiInsights && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden animate-in slide-in-from-top duration-500">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setAiInsights('')} className="text-indigo-400 hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex gap-3 items-start">
                <ICONS.Sparkles className="w-6 h-6 text-indigo-500 mt-1" />
                <div className="prose prose-sm prose-indigo max-w-none">
                  <h4 className="text-indigo-900 font-bold mb-2">Analisi AI della Spesa</h4>
                  <div className="text-indigo-800 whitespace-pre-wrap">{aiInsights}</div>
                </div>
              </div>
            </div>
          )}

          {view === 'dashboard' && <Dashboard orders={orders} />}
          
          {view === 'catalog' && (
            <Catalog 
              orders={orders} 
              onEdit={(o) => { setEditingOrder(o); setView('edit'); }}
              onBid={(o) => setBiddingOrder(o)}
            />
          )}

          {view === 'add' && (
            <div className="max-w-3xl mx-auto">
              <WorkForm onSubmit={handleAddOrder} onCancel={() => setView('catalog')} />
            </div>
          )}

          {view === 'edit' && editingOrder && (
            <div className="max-w-3xl mx-auto">
              <WorkForm 
                initialData={editingOrder} 
                onSubmit={handleUpdateOrder} 
                onCancel={() => { setEditingOrder(null); setView('catalog'); }} 
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {biddingOrder && (
        <BidModal 
          order={biddingOrder} 
          onSave={handleSaveBid} 
          onClose={() => setBiddingOrder(null)} 
        />
      )}
    </div>
  );
};

export default App;

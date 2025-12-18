
import React from 'react';
import { WorkOrder, WorkStatus } from '../types';

interface CatalogProps {
  orders: WorkOrder[];
  onEdit: (order: WorkOrder) => void;
  onBid: (order: WorkOrder) => void;
}

const Catalog: React.FC<CatalogProps> = ({ orders, onEdit, onBid }) => {
  const getStatusColor = (status: WorkStatus) => {
    switch (status) {
      case WorkStatus.PLANNING: return 'bg-gray-100 text-gray-700';
      case WorkStatus.BIDDING: return 'bg-amber-100 text-amber-700';
      case WorkStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case WorkStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case WorkStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">N. Ordine</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrizione & Capitolo</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stato</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Budget & Offerta</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Risparmio</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const economy = order.bidResult ? order.originalValue - order.bidResult.bidValue : 0;
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{order.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.chapter} • {order.financingSource}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-xs text-gray-400">Budget: €{order.originalValue.toLocaleString()}</p>
                    {order.bidResult ? (
                      <p className="text-sm font-bold text-emerald-600">Offerta: €{order.bidResult.bidValue.toLocaleString()}</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-1">In attesa gara</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.bidResult ? (
                      <span className="text-sm font-bold text-amber-600">€{economy.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(order)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Modifica Dettagli"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onBid(order)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Registra Risultato Gara"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {orders.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-400 italic">Nessun ordine trovato. Crea il primo per iniziare.</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;

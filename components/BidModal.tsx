
import React, { useState } from 'react';
import { WorkOrder, BidResult } from '../types';

interface BidModalProps {
  order: WorkOrder;
  onSave: (bid: BidResult) => void;
  onClose: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ order, onSave, onClose }) => {
  const [bidData, setBidData] = useState<BidResult>({
    winner: order.bidResult?.winner || '',
    bidValue: order.bidResult?.bidValue || order.originalValue,
    date: order.bidResult?.date || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(bidData);
  };

  const economy = order.originalValue - bidData.bidValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Registra Risultato Gara</h3>
          <p className="text-indigo-100 text-sm">{order.orderNumber} - {order.description}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aggiudicatario (Vincitore)</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={bidData.winner}
              onChange={(e) => setBidData({ ...bidData, winner: e.target.value })}
              placeholder="Nome azienda"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valore Offerta Vincente (€)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={bidData.bidValue}
              onChange={(e) => setBidData({ ...bidData, bidValue: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Aggiudicazione</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={bidData.date}
              onChange={(e) => setBidData({ ...bidData, date: e.target.value })}
            />
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-100 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700 font-medium">Risparmio Stimato:</span>
              <span className="text-green-800 font-bold text-lg">€{economy.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-all"
            >
              Salva Risultato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidModal;


import React, { useState } from 'react';
import { WorkOrder, WorkStatus } from '../types';
import { CHAPTERS, FINANCING_SOURCES } from '../constants';

interface WorkFormProps {
  onSubmit: (order: Partial<WorkOrder>) => void;
  onCancel: () => void;
  initialData?: WorkOrder;
}

const WorkForm: React.FC<WorkFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<WorkOrder>>(
    initialData || {
      orderNumber: '',
      description: '',
      originalValue: 0,
      chapter: CHAPTERS[0],
      financingSource: FINANCING_SOURCES[0],
      status: WorkStatus.PLANNING
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {initialData ? 'Modifica Ordine di Lavoro' : 'Nuovo Ordine di Lavoro'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numero Ordine</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={formData.orderNumber}
            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            placeholder="es., ORD-2024-00X"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
          <textarea
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Descrivi l'attività o il progetto..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valore Originale (€)</label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={formData.originalValue}
              onChange={(e) => setFormData({ ...formData, originalValue: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkStatus })}
            >
              {Object.values(WorkStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capitolo</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.chapter}
              onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
            >
              {CHAPTERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fonte di Finanziamento</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.financingSource}
              onChange={(e) => setFormData({ ...formData, financingSource: e.target.value })}
            >
              {FINANCING_SOURCES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
          >
            {initialData ? 'Aggiorna Ordine' : 'Crea Ordine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkForm;

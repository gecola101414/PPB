
import React, { useMemo } from 'react';
import { WorkOrder, WorkStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  orders: WorkOrder[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const stats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalEconomies = 0;

    const chapterData: Record<string, { budget: number, spent: number }> = {};
    const statusCount: Record<string, number> = {};

    orders.forEach(o => {
      totalBudget += o.originalValue;
      if (o.bidResult) {
        totalSpent += o.bidResult.bidValue;
        totalEconomies += (o.originalValue - o.bidResult.bidValue);
      }

      if (!chapterData[o.chapter]) {
        chapterData[o.chapter] = { budget: 0, spent: 0 };
      }
      chapterData[o.chapter].budget += o.originalValue;
      if (o.bidResult) {
        chapterData[o.chapter].spent += o.bidResult.bidValue;
      }

      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });

    const chapterChart = Object.entries(chapterData).map(([name, vals]) => ({
      name,
      budget: vals.budget,
      spent: vals.spent
    }));

    const statusChart = Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));

    return { totalBudget, totalSpent, totalEconomies, chapterChart, statusChart };
  }, [orders]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Budget Totale Stanziato</p>
          <p className="text-3xl font-bold text-gray-900">€{stats.totalBudget.toLocaleString()}</p>
          <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">Su {orders.length} Progetti</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Spesa Effettiva Totale</p>
          <p className="text-3xl font-bold text-emerald-600">€{stats.totalSpent.toLocaleString()}</p>
          <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">Basata sui Risultati di Gara</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-1">Economie Totali Generate</p>
          <p className="text-3xl font-bold text-amber-500">€{stats.totalEconomies.toLocaleString()}</p>
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded">Efficienza Risparmio: {((stats.totalEconomies / (stats.totalSpent + stats.totalEconomies || 1)) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Spesa per Capitolo</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chapterChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `€${Number(value).toLocaleString()}`}
                />
                <Bar dataKey="budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Budget Originale" />
                <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} name="Spesa Effettiva" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribuzione Stato Lavori</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-4 space-y-2">
              {stats.statusChart.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

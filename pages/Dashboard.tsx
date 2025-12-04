import React, { useEffect, useState } from 'react';
import { getAppData } from '../services/storageService';
import { AppData, Transaction } from '../types';
import { DollarSign, AlertCircle, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(getAppData());
  }, []);

  if (!data) return <div>Loading...</div>;

  const today = new Date().toDateString();
  const todaysTransactions = data.transactions.filter(t => new Date(t.date).toDateString() === today);
  const dailySales = todaysTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  
  const pendingCollectibles = data.transactions
    .filter(t => t.paymentStatus !== 'PAID')
    .reduce((acc, t) => acc + (t.totalAmount - t.amountPaid), 0);

  const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalRevenue = data.transactions.reduce((acc, t) => acc + t.amountPaid, 0);
  const profit = totalRevenue - totalExpenses;

  const recentTransactions = data.transactions.slice(0, 5);

  const categoryData = [
    { name: 'Paid', value: totalRevenue },
    { name: 'Collectibles', value: pendingCollectibles },
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Daily Sales</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₱{dailySales.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Collectibles (Unpaid)</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">₱{pendingCollectibles.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Profit (All Time)</p>
              <h3 className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₱{profit.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">₱{totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-sm">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-medium text-slate-800">{t.customerName}</td>
                    <td className="py-3 text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${t.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                          t.paymentStatus === 'PARTIAL' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-slate-800">₱{t.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-800 mb-4 self-start">Revenue vs Receivables</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `₱${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              Paid
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              Unpaid
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
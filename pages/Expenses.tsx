import React, { useState, useEffect } from 'react';
import { getAppData, addExpense } from '../services/storageService';
import { AppData, Expense } from '../types';
import { Plus, Calendar, Tag, DollarSign } from 'lucide-react';

const Expenses: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
  });

  useEffect(() => {
    setData(getAppData());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      recordedBy: 'u1'
    };

    addExpense(expense);
    setNewExpense({ category: '', description: '', amount: '' });
    setData(getAppData()); // Refresh
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Expense Tracker</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <Plus size={20} className="mr-2 text-blue-600" /> Record New Expense
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <select 
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Utilities">Utilities (Electricity/Internet)</option>
                  <option value="Rent">Rent</option>
                  <option value="Supplies">Supplies (Ink/Paper/Parts)</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                rows={3}
                placeholder="Details..."
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
              />
            </div>

            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
              Save Expense
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Expense History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.expenses.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-400">No expenses recorded.</td></tr>
                ) : (
                  data.expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-slate-400" />
                          {new Date(exp.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{exp.description}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">-₱{exp.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
import React, { useState, useEffect } from 'react';
import { getAppData, updateTransaction } from '../services/storageService';
import { AppData, Transaction } from '../types';
import { CheckCircle, Search, AlertTriangle } from 'lucide-react';

const Collectibles: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setData(getAppData());
  }, []);

  if (!data) return <div>Loading...</div>;

  const unpaidTransactions = data.transactions.filter(t => t.paymentStatus !== 'PAID');
  
  const filteredTransactions = unpaidTransactions.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id.includes(searchTerm)
  );

  const handleSettle = (tx: Transaction) => {
    const remaining = tx.totalAmount - tx.amountPaid;
    const confirm = window.confirm(`Mark remainder ₱${remaining} as paid for ${tx.customerName}?`);
    
    if (confirm) {
      const updatedTx: Transaction = {
        ...tx,
        amountPaid: tx.totalAmount,
        paymentStatus: 'PAID',
        notes: (tx.notes || '') + ' [Settled Full Payment]'
      };
      updateTransaction(updatedTx);
      setData(getAppData()); // Refresh
    }
  };

  const totalReceivable = unpaidTransactions.reduce((acc, t) => acc + (t.totalAmount - t.amountPaid), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Collectibles</h2>
          <p className="text-slate-500">Manage unpaid debts and accounts receivable.</p>
        </div>
        <div className="bg-amber-50 px-6 py-3 rounded-xl border border-amber-200">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Total Pending</p>
          <p className="text-2xl font-bold text-amber-800">₱{totalReceivable.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search customer name..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Paid</th>
                <th className="px-6 py-3 font-medium">Balance</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No pending collectibles found. Great job!
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const balance = tx.totalAmount - tx.amountPaid;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {tx.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {tx.items.length} items
                        <div className="text-xs text-slate-400 truncate w-48">
                          {tx.items.map(i => i.name).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800">₱{tx.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-emerald-600">₱{tx.amountPaid.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">₱{balance.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleSettle(tx)}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md text-sm font-medium transition-colors flex items-center inline-flex"
                        >
                          <CheckCircle size={16} className="mr-1.5" /> Mark Paid
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Collectibles;
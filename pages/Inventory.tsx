import React, { useState, useEffect } from 'react';
import { getAppData, updateProductStock } from '../services/storageService';
import { AppData } from '../types';
import { Package, Search, Plus } from 'lucide-react';

const Inventory: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(getAppData());
  }, []);

  const handleStockUpdate = (id: string, current: number) => {
    const newStockStr = prompt("Enter new stock quantity:", current.toString());
    if (newStockStr !== null) {
      const diff = parseInt(newStockStr) - current;
      if (!isNaN(diff)) {
        updateProductStock(id, diff);
        setData(getAppData()); // Refresh
      }
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Inventory & Services</h2>
          <p className="text-slate-500">Manage products stock and service pricing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Package className="mr-2" size={20} /> Products
            </h3>
            <button className="text-sm text-blue-600 hover:underline">+ Add New</button>
          </div>
          <table className="w-full text-left">
            <thead className="text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600">₱{p.price}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => handleStockUpdate(p.id, p.stock)}
                      className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                    >
                      {p.stock} units
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Package className="mr-2" size={20} /> Services
            </h3>
            <button className="text-sm text-blue-600 hover:underline">+ Add New</button>
          </div>
          <table className="w-full text-left">
            <thead className="text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Service Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Base Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.services.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{s.category}</td>
                  <td className="px-4 py-3 text-right font-medium text-blue-600">
                    ₱{s.basePrice} <span className="text-slate-400 text-xs font-normal">/ {s.unit?.replace('per ', '')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
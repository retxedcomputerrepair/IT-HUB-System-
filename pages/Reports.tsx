import React, { useState, useEffect } from 'react';
import { getAppData } from '../services/storageService';
import { generateBusinessInsight } from '../services/geminiService';
import { AppData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // We'll just assume standard text if package not avail, but let's try to simulate or use simple whitespace rendering

const Reports: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [reportType, setReportType] = useState<'DAILY' | 'MONTHLY'>('DAILY');

  useEffect(() => {
    setData(getAppData());
  }, []);

  if (!data) return <div>Loading...</div>;

  // Transform data for charts
  const getChartData = () => {
    const grouped: Record<string, { name: string; sales: number; expenses: number }> = {};

    if (reportType === 'DAILY') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
        const isoDate = d.toDateString();
        
        grouped[isoDate] = { name: dateStr, sales: 0, expenses: 0 };
      }

      data.transactions.forEach(t => {
        const d = new Date(t.date).toDateString();
        if (grouped[d]) grouped[d].sales += t.amountPaid;
      });

      data.expenses.forEach(e => {
        const d = new Date(e.date).toDateString();
        if (grouped[d]) grouped[d].expenses += e.amount;
      });
    } else {
      // Monthly (Current Year)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(m => grouped[m] = { name: m, sales: 0, expenses: 0 });

      data.transactions.forEach(t => {
        if (new Date(t.date).getFullYear() === new Date().getFullYear()) {
          const m = months[new Date(t.date).getMonth()];
          grouped[m].sales += t.amountPaid;
        }
      });
      data.expenses.forEach(e => {
        if (new Date(e.date).getFullYear() === new Date().getFullYear()) {
          const m = months[new Date(e.date).getMonth()];
          grouped[m].expenses += e.amount;
        }
      });
    }

    return Object.values(grouped);
  };

  const chartData = getChartData();

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const insight = await generateBusinessInsight(data.transactions, data.expenses);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Financial Reports</h2>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          <button 
            onClick={() => setReportType('DAILY')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${reportType === 'DAILY' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setReportType('MONTHLY')}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${reportType === 'MONTHLY' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Income vs Expenses</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `₱${val}`} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="sales" name="Sales Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <Sparkles className="mr-2 text-yellow-400" /> AI Business Analyst
            </h3>
          </div>
          
          <div className="flex-1 bg-white/10 rounded-lg p-4 overflow-y-auto mb-4 text-sm leading-relaxed text-slate-200">
            {loadingAi ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin mr-2" /> Analyzing data...
              </div>
            ) : aiInsight ? (
              <div className="whitespace-pre-wrap font-sans">{aiInsight}</div>
            ) : (
              <p className="text-slate-400 italic text-center mt-10">
                Click "Generate Analysis" to get a professional summary of your financial health, identifying trends and actionable advice.
              </p>
            )}
          </div>

          <button 
            onClick={handleGenerateInsight}
            disabled={loadingAi}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-70"
          >
            {loadingAi ? 'Generating...' : 'Generate Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
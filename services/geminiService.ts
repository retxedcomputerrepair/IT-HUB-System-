import { GoogleGenAI } from "@google/genai";
import { Transaction, Expense } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBusinessInsight = async (
  transactions: Transaction[],
  expenses: Expense[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "AI Service Unavailable (Missing API Key)";

  // Filter last 30 days for relevance
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentSales = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
  const recentExpenses = expenses.filter(e => new Date(e.date) >= thirtyDaysAgo);

  const totalSales = recentSales.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalPaid = recentSales.reduce((acc, t) => acc + t.amountPaid, 0);
  const totalExpenses = recentExpenses.reduce((acc, e) => acc + e.amount, 0);
  const receivables = totalSales - totalPaid;

  const prompt = `
    Act as a senior financial analyst for a small IT Service and Printing Shop.
    Analyze the following financial summary for the last 30 days:

    - Total Revenue Generated: ₱${totalSales.toFixed(2)}
    - Cash Collected: ₱${totalPaid.toFixed(2)}
    - Accounts Receivable (Collectibles): ₱${receivables.toFixed(2)}
    - Total Expenses: ₱${totalExpenses.toFixed(2)}
    - Net Profit (Cash Basis): ₱${(totalPaid - totalExpenses).toFixed(2)}

    Expense Breakdown: ${recentExpenses.map(e => `${e.category}: ${e.amount}`).join(', ').slice(0, 300)}...
    
    Provide a concise, professional executive summary. Highlight 2 key strengths and 2 risks/recommendations. 
    Focus on cash flow, collectibles management, and profitability. 
    Format the response in Markdown with bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights. Please try again later.";
  }
};
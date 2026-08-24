import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY is not defined in the .env file');
  }
  return key;
};

/**
 * Compiles the raw context string from the FinanceContext data
 */
export const buildFinancialContext = (data) => {
  const { networthHistory = [], netWorthHistory = [], assetCategories = [], liabilityCategories = [], budgets = [], transactions = [] } = data;
  const history = networthHistory.length > 0 ? networthHistory : netWorthHistory;
  
  const currentNetWorth = history.length > 0 ? history[history.length - 1].netWorth : 0;
  
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEmi = 0;

  const assetsText = assetCategories.map(cat => {
    const entries = cat.entries || cat.holdings || [];
    const catTotal = entries.reduce((sum, h) => sum + (parseFloat(h.currentValue) || 0), 0);
    totalAssets += catTotal;
    const entriesText = entries.map(h => `    - ${h.name || h.holdingName}: ₹${h.currentValue} (Invested: ₹${h.investedAmount})`).join('\n');
    return `  - Category: ${cat.name} (Total: ₹${catTotal})\n${entriesText}`;
  }).join('\n');

  const liabilitiesText = liabilityCategories.map(cat => {
    const entries = cat.entries || cat.liabilities || [];
    const catTotal = entries.reduce((sum, e) => sum + (parseFloat(e.outstandingAmount) || 0), 0);
    totalLiabilities += catTotal;
    const entriesText = entries.map(e => {
      totalEmi += parseFloat(e.emi) || 0;
      return `    - ${e.name}: ₹${e.outstandingAmount} (EMI: ₹${e.emi}, Interest: ${e.interestRate}%)`;
    }).join('\n');
    return `  - Category: ${cat.name} (Total: ₹${catTotal})\n${entriesText}`;
  }).join('\n');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const budgetText = budgets.length > 0 ? budgets.map(b => {
    const limit = parseFloat(b.amount) || 0;
    const spent = transactions
      .filter(t => {
        if (t.type !== 'expense' || t.category !== b.name) return false;
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return `  - ${b.name}: Limit ₹${limit}, Spent ₹${spent} (${pct}% used)`;
  }).join('\n') : '  - None';

  const txText = transactions.length > 0 ? transactions.slice(0, 50).map(t => {
    const dateStr = t.date ? new Date(t.date).toLocaleDateString() : 'Unknown Date';
    return `  - ${dateStr} | ${t.type} | ${t.category} | ₹${t.amount} | ${t.description || ''}`;
  }).join('\n') : '  - None';

  return `
USER FINANCIAL PORTFOLIO SUMMARY:
--------------------------------
Current Net Worth: ₹${currentNetWorth}
Total Assets: ₹${totalAssets}
Total Liabilities: ₹${totalLiabilities}
Total Monthly EMI Commitments: ₹${totalEmi}

ASSETS:
${assetsText || 'None'}

LIABILITIES:
${liabilitiesText || 'None'}

BUDGETS:
${budgetText}

RECENT TRANSACTIONS (Up to 50):
${txText}

Instructions to AI: You are an expert financial advisor. Base all your responses strictly on the data provided above.
`;
};

/**
 * Analyzes the portfolio and returns a structured JSON Health Report
 */
export const generateHealthReport = async (portfolioData) => {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });

  const context = buildFinancialContext(portfolioData);
  const prompt = `
${context}

Analyze the user's financial portfolio. Return a JSON object EXACTLY in this format:
{
  "score": number, // Health score from 0 to 100 based on debt-to-asset ratio, diversification, etc.
  "pros": ["string", "string"], // 2 to 4 positive aspects of their portfolio
  "cons": ["string", "string"], // 2 to 4 risks or negative aspects
  "immediateActions": ["string", "string"] // 2 to 4 immediate actionable recommendations
}
Ensure the output is ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('AI Health Report Error:', error);
    throw error;
  }
};

/**
 * Initializes a new chat session with the user's financial context as the system instruction
 */
export const createAdvisorChat = (portfolioData) => {
  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const context = buildFinancialContext(portfolioData);
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: context + "\nBe concise, friendly, and analytical. Don't use markdown headers unless necessary, stick to short paragraphs and bullet points."
  });

  return model.startChat({
    history: [],
  });
};

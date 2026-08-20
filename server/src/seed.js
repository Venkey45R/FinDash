/**
 * Seed script — Populates MongoDB with initial Instrument catalog and
 * structured hierarchical category data for Assets and Liabilities.
 *
 * Run: npm run seed  (from server directory) or node src/seed.js
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Instrument = require('./models/Instrument');
const AssetCategory = require('./models/AssetCategory');
const LiabilityCategory = require('./models/LiabilityCategory');
const NetWorthHistory = require('./models/NetWorthHistory');
const { defaultInstruments } = require('./routes/instrumentRoutes');

const seed = async () => {
  await connectDB();

  // Clear ALL collections for a fresh start
  await Instrument.deleteMany({});
  await AssetCategory.deleteMany({});
  await LiabilityCategory.deleteMany({});
  await NetWorthHistory.deleteMany({});
  console.log('Cleared all existing data (instruments, categories, history).');

  // Seed Instruments Catalog
  const createdInstruments = await Instrument.insertMany(defaultInstruments);
  console.log(`Seeded ${createdInstruments.length} market instruments.`);

  const getInst = (sym) => createdInstruments.find((i) => i.symbol === sym);

  // Get or create user
  let user = await User.findOne();
  if (!user) {
    user = await User.create({ name: 'Venkatesh', email: 'venkatesh@example.com' });
    console.log('Created user:', user.name);
  } else {
    console.log('Using existing user:', user.name);
  }

  // ─── ASSET CATEGORIES (Real Portfolio Data) ───

  const itcInst = getInst('ITC');
  const tcsInst = getInst('TCS');
  const infyInst = getInst('INFY') || getInst('INFOSYS');

  // 1. Domestic Equity — invested: 130756, current: 129785
  await AssetCategory.create({
    userId: user._id,
    name: 'Domestic Equity',
    icon: 'TrendingUp',
    color: 'bg-teal-500',
    order: 1,
    entries: [
      {
        name: 'Tata Motors Commercial Vehicle',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 5,
        averageBuyPrice: 269.60,
        investedAmount: 1348,
        currentValue: 2352,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'TMB',
        symbol: 'TMB',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 7,
        averageBuyPrice: 503.57,
        investedAmount: 3525,
        currentValue: 5906,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'CDSL',
        symbol: 'CDSL',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 3,
        averageBuyPrice: 1298.33,
        investedAmount: 3895,
        currentValue: 4070,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'HDFC',
        symbol: 'HDFCBANK',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 10,
        averageBuyPrice: 763.50,
        investedAmount: 7635,
        currentValue: 7290,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'Natco',
        symbol: 'NATCOPHARM',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 6,
        averageBuyPrice: 939.33,
        investedAmount: 5636,
        currentValue: 5339,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'TCS',
        symbol: 'TCS',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 4,
        averageBuyPrice: 2500,
        investedAmount: 10000,
        currentValue: 9253,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'Infosys',
        symbol: 'INFY',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 5,
        averageBuyPrice: 1235,
        investedAmount: 6175,
        currentValue: 5700,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'TMPV',
        symbol: 'TMPV',
        exchange: 'NSE',
        subCategory: 'STOCKS',
        valuationType: 'MARKET',
        quantity: 13,
        averageBuyPrice: 595.92,
        investedAmount: 7747,
        currentValue: 4293,
        purchaseDate: new Date('2024-01-01'),
      },
      {
        name: 'UTI Nifty 50 Index Fund',
        symbol: 'UTINIFTY50',
        exchange: 'NSE',
        plan: 'Direct · Growth',
        subCategory: 'MUTUAL_FUNDS',
        valuationType: 'MARKET',
        units: 347.09,
        averageNAV: 169.4,
        investedAmount: 58797,
        currentValue: 59554,
        purchaseDate: new Date('2023-11-20'),
      },
      {
        name: 'Parag Parikh Flexi Cap Fund',
        symbol: 'PPFAS',
        exchange: 'NSE',
        plan: 'Direct · Growth',
        subCategory: 'MUTUAL_FUNDS',
        valuationType: 'MARKET',
        units: 283.29,
        averageNAV: 91.58,
        investedAmount: 25998,
        currentValue: 26028,
        purchaseDate: new Date('2024-01-05'),
      },
    ],
  });
  console.log('Created Domestic Equity category — Invested: ₹130,756 | Current: ₹129,785');

  // 2. Foreign Equity — invested: 0, current: 0
  await AssetCategory.create({
    userId: user._id,
    name: 'Foreign Equity',
    icon: 'Globe',
    color: 'bg-blue-500',
    order: 2,
    entries: [],
  });
  console.log('Created Foreign Equity category (empty).');

  // 3. Debt — invested & current: 21600
  await AssetCategory.create({
    userId: user._id,
    name: 'Debt',
    icon: 'Shield',
    color: 'bg-indigo-500',
    order: 3,
    entries: [
      {
        name: 'EPF',
        subCategory: 'OTHER',
        valuationType: 'MANUAL',
        investedAmount: 21600,
        currentValue: 21600,
      },
    ],
  });
  console.log('Created Debt category — ₹21,600');

  // 4. Gold — invested: 41000, current: 48562
  await AssetCategory.create({
    userId: user._id,
    name: 'Gold',
    icon: 'Gem',
    color: 'bg-amber-500',
    order: 4,
    entries: [
      {
        name: 'Gold Jewellery',
        subCategory: 'OTHER',
        valuationType: 'MANUAL',
        investedAmount: 41000,
        currentValue: 48562,
      },
    ],
  });
  console.log('Created Gold category — Invested: ₹41,000 | Current: ₹48,562');

  // 5. Cash — current: 25953
  await AssetCategory.create({
    userId: user._id,
    name: 'Cash',
    icon: 'Banknote',
    color: 'bg-emerald-500',
    order: 5,
    entries: [
      {
        name: 'Savings Account',
        subCategory: 'OTHER',
        valuationType: 'MANUAL',
        investedAmount: 25953,
        currentValue: 25953,
      },
    ],
  });
  console.log('Created Cash category — ₹25,953');

  // ─── LIABILITY CATEGORIES (No liabilities) ───

  await LiabilityCategory.create({
    userId: user._id,
    name: 'Home Loans',
    icon: 'Home',
    color: 'bg-rose-500',
    order: 1,
    entries: [],
  });

  await LiabilityCategory.create({
    userId: user._id,
    name: 'Vehicle Loans',
    icon: 'Car',
    color: 'bg-orange-500',
    order: 2,
    entries: [],
  });

  await LiabilityCategory.create({
    userId: user._id,
    name: 'Personal & Consumer Loans',
    icon: 'GraduationCap',
    color: 'bg-purple-500',
    order: 3,
    entries: [],
  });

  await LiabilityCategory.create({
    userId: user._id,
    name: 'Credit Cards',
    icon: 'CreditCard',
    color: 'bg-red-500',
    order: 4,
    entries: [],
  });

  await LiabilityCategory.create({
    userId: user._id,
    name: 'Other Liabilities',
    icon: 'ShieldAlert',
    color: 'bg-amber-600',
    order: 5,
    entries: [],
  });

  console.log('Created all liability categories (empty — ₹0 total).');

  // ─── Net Worth Snapshot (Today Only — Fresh Start) ───

  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // '2026-08-17'
  const dayNum = today.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabel = `${dayNum} ${monthNames[today.getMonth()]}`;

  await NetWorthHistory.create({
    userId: user._id,
    dateString: dateString,
    month: monthLabel,
    netWorth: 225900,
    totalAssets: 225900,
    totalLiabilities: 0,
    recordedAt: today,
  });
  console.log(`Recorded today's net worth snapshot: ₹2,25,900 (${dateString})`);

  console.log('\n✅ FinDash Seed Complete — Fresh start with your real data!');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

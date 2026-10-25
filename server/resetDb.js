/**
 * resetDb.js — Clears all user data from the DB and seeds fresh default categories.
 * Run once: node server/resetDb.js
 */
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

// ── Inline minimal models (avoid importing full server models) ──

const AssetCategorySchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, icon: String, color: String, order: Number, entries: Array }, { strict: false });
const LiabilityCategorySchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, icon: String, color: String, order: Number, entries: Array }, { strict: false });
const UserSchema = new mongoose.Schema({}, { strict: false });
const TransactionSchema = new mongoose.Schema({}, { strict: false });
const BudgetSchema = new mongoose.Schema({}, { strict: false });
const IncomeCategorySchema = new mongoose.Schema({}, { strict: false });
const NetWorthHistorySchema = new mongoose.Schema({}, { strict: false });

const AssetCategory = mongoose.model('AssetCategory', AssetCategorySchema);
const LiabilityCategory = mongoose.model('LiabilityCategory', LiabilityCategorySchema);
const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Budget = mongoose.model('Budget', BudgetSchema);
const IncomeCategory = mongoose.model('IncomeCategory', IncomeCategorySchema);
const NetWorthHistory = mongoose.model('NetWorthHistory', NetWorthHistorySchema);

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.\n');

  // ── Step 1: Delete all user data ──
  console.log('Deleting all existing data...');
  await Promise.all([
    Transaction.deleteMany({}),
    Budget.deleteMany({}),
    IncomeCategory.deleteMany({}),
    NetWorthHistory.deleteMany({}),
    AssetCategory.deleteMany({}),
    LiabilityCategory.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('All data cleared.\n');

  // ── Step 2: Create a single owner user ──
  console.log('Creating single owner user...');
  const user = await User.create({
    name: 'Venkatesh',
    email: 'owner@findash.local',
    authProvider: 'local',
    isOnboarded: true,
  });
  console.log(`Created user: ${user._id}\n`);

  // ── Step 3: Seed default asset categories ──
  const assetCategories = [
    { userId: user._id, name: 'Domestic Equity', icon: 'TrendingUp', color: 'bg-teal-500', order: 1, entries: [] },
    { userId: user._id, name: 'Foreign Equity', icon: 'Globe', color: 'bg-blue-500', order: 2, entries: [] },
    { userId: user._id, name: 'Debt', icon: 'Shield', color: 'bg-indigo-500', order: 3, entries: [] },
    { userId: user._id, name: 'Gold', icon: 'Gem', color: 'bg-amber-500', order: 4, entries: [] },
    { userId: user._id, name: 'Cash', icon: 'Banknote', color: 'bg-emerald-500', order: 5, entries: [] },
  ];

  const liabilityCategories = [
    { userId: user._id, name: 'Home Loans', icon: 'Home', color: 'bg-rose-500', order: 1, entries: [] },
    { userId: user._id, name: 'Vehicle Loans', icon: 'Car', color: 'bg-orange-500', order: 2, entries: [] },
    { userId: user._id, name: 'Personal & Consumer Loans', icon: 'GraduationCap', color: 'bg-purple-500', order: 3, entries: [] },
    { userId: user._id, name: 'Credit Cards', icon: 'CreditCard', color: 'bg-red-500', order: 4, entries: [] },
    { userId: user._id, name: 'Other Liabilities', icon: 'ShieldAlert', color: 'bg-amber-600', order: 5, entries: [] },
  ];

  await Promise.all([
    AssetCategory.insertMany(assetCategories),
    LiabilityCategory.insertMany(liabilityCategories),
  ]);

  console.log('Seeded 5 asset categories and 5 liability categories.\n');
  console.log('✅ Database reset complete! You are ready to go.\n');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error during reset:', err);
  process.exit(1);
});

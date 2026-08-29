const AssetCategory = require('../models/AssetCategory');
const LiabilityCategory = require('../models/LiabilityCategory');

/**
 * Seeds default empty asset and liability categories for a newly registered user.
 * Called once during signup so the dashboard has structure from the start.
 */
async function seedDefaultCategories(userId) {
  // Default Asset Categories
  const assetCategories = [
    { userId, name: 'Domestic Equity', icon: 'TrendingUp', color: 'bg-teal-500', order: 1, entries: [] },
    { userId, name: 'Foreign Equity', icon: 'Globe', color: 'bg-blue-500', order: 2, entries: [] },
    { userId, name: 'Debt', icon: 'Shield', color: 'bg-indigo-500', order: 3, entries: [] },
    { userId, name: 'Gold', icon: 'Gem', color: 'bg-amber-500', order: 4, entries: [] },
    { userId, name: 'Cash', icon: 'Banknote', color: 'bg-emerald-500', order: 5, entries: [] },
  ];

  // Default Liability Categories
  const liabilityCategories = [
    { userId, name: 'Home Loans', icon: 'Home', color: 'bg-rose-500', order: 1, entries: [] },
    { userId, name: 'Vehicle Loans', icon: 'Car', color: 'bg-orange-500', order: 2, entries: [] },
    { userId, name: 'Personal & Consumer Loans', icon: 'GraduationCap', color: 'bg-purple-500', order: 3, entries: [] },
    { userId, name: 'Credit Cards', icon: 'CreditCard', color: 'bg-red-500', order: 4, entries: [] },
    { userId, name: 'Other Liabilities', icon: 'ShieldAlert', color: 'bg-amber-600', order: 5, entries: [] },
  ];

  await Promise.all([
    AssetCategory.insertMany(assetCategories),
    LiabilityCategory.insertMany(liabilityCategories),
  ]);

  console.log(`[Seed] Created default categories for user ${userId}`);
}

module.exports = { seedDefaultCategories };

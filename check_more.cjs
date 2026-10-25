require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function checkMore() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const transactions = await db.collection('transactions').find({}).toArray();
  console.log('=== TRANSACTIONS count:', transactions.length);
  transactions.forEach(t => console.log('Tx:', t._id, t.userId, t.type, t.amount, t.description));

  const budgets = await db.collection('budgets').find({}).toArray();
  console.log('=== BUDGETS count:', budgets.length);
  budgets.forEach(b => console.log('Budget:', b._id, b.userId, b.name, b.amount));

  const incomeCategories = await db.collection('incomecategories').find({}).toArray();
  console.log('=== INCOME CATEGORIES count:', incomeCategories.length);
  incomeCategories.forEach(ic => console.log('IncomeCat:', ic._id, ic.userId, ic.name));

  await mongoose.disconnect();
}

checkMore().catch(console.error);

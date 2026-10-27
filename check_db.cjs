require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  console.log('=== USERS count:', users.length);
  users.forEach(u => console.log('User:', u._id, u.email, u.name));

  const assetCategories = await db.collection('assetcategories').find({}).toArray();
  console.log('\n=== ASSET CATEGORIES count:', assetCategories.length);
  assetCategories.forEach(a => console.log('AssetCat:', a._id, a.userId, a.name, 'order:', a.order, 'entries count:', (a.entries || []).length));

  const liabilityCategories = await db.collection('liabilitycategories').find({}).toArray();
  console.log('\n=== LIABILITY CATEGORIES count:', liabilityCategories.length);
  liabilityCategories.forEach(l => console.log('LiabilityCat:', l._id, l.userId, l.name, 'entries count:', (l.entries || []).length));

  const history = await db.collection('networthhistories').find({}).sort({ dateString: 1 }).toArray();
  console.log('\n=== NET WORTH HISTOR Y count:', history.length);
  history.forEach(h => console.log('History:', h._id, h.userId, h.dateString, h.month, h.netWorth, h.recordedAt));

  await mongoose.disconnect();
}

check().catch(console.error);

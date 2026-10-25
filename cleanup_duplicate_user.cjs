require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const user2Id = new mongoose.Types.ObjectId('6ad47eb0c3c0f5c616d8b074');
  const user1Id = new mongoose.Types.ObjectId('6ad47ac9a1823ae3f6b42e28');

  // Verify user 2 has 0 holdings
  const user2AssetCats = await db.collection('assetcategories').find({ userId: user2Id }).toArray();
  const user2EntriesCount = user2AssetCats.reduce((sum, c) => sum + (c.entries ? c.entries.length : 0), 0);
  console.log('User 2 asset entries count:', user2EntriesCount);

  if (user2EntriesCount === 0) {
    const delCats = await db.collection('assetcategories').deleteMany({ userId: user2Id });
    console.log('Deleted user 2 asset categories:', delCats.deletedCount);

    const delLiab = await db.collection('liabilitycategories').deleteMany({ userId: user2Id });
    console.log('Deleted user 2 liability categories:', delLiab.deletedCount);

    const delHistory = await db.collection('networthhistories').deleteMany({ userId: user2Id });
    console.log('Deleted user 2 net worth history snapshots:', delHistory.deletedCount);

    const delUser = await db.collection('users').deleteOne({ _id: user2Id });
    console.log('Deleted user 2 from users collection:', delUser.deletedCount);

    // Update user 1 email to venkateshamulraj@gmail.com
    await db.collection('users').updateOne(
      { _id: user1Id },
      { $set: { email: 'venkateshamulraj@gmail.com', name: 'Venkatesh' } }
    );
    console.log('Updated user 1 email to venkateshamulraj@gmail.com');
  }

  // Deduplicate any networthhistory snapshots for user 1 if duplicate dateStrings exist
  const u1History = await db.collection('networthhistories').find({ userId: user1Id }).sort({ recordedAt: 1 }).toArray();
  const seenDates = new Map();
  const toDelete = [];
  for (const h of u1History) {
    if (seenDates.has(h.dateString)) {
      toDelete.push(seenDates.get(h.dateString)); // delete the older one
    }
    seenDates.set(h.dateString, h._id);
  }
  if (toDelete.length > 0) {
    await db.collection('networthhistories').deleteMany({ _id: { $in: toDelete } });
    console.log('Deleted older duplicate networth snapshots for user 1:', toDelete.length);
  }

  console.log('Cleanup finished successfully!');
  await mongoose.disconnect();
}

cleanup().catch(console.error);

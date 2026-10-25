const User = require('../models/User');

let _cachedUser = null;

/**
 * Returns the single user object, or creates the default owner user if DB is empty.
 */
async function getSingleUser() {
  if (_cachedUser) return _cachedUser;

  let user = await User.findOne({});
  if (!user) {
    user = await User.create({
      name: 'Venkatesh',
      email: 'owner@findash.local',
      isOnboarded: true,
    });
    console.log('[SingleUser] Created default owner user:', user._id);
  }

  _cachedUser = user;
  return user;
}

/**
 * Returns the single user ObjectId.
 */
async function getSingleUserId() {
  const user = await getSingleUser();
  return user ? user._id : null;
}

/**
 * Clears the user cache if needed.
 */
function clearUserCache() {
  _cachedUser = null;
}

module.exports = {
  getSingleUser,
  getSingleUserId,
  clearUserCache,
};

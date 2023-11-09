const { getCredentials } = require("../utils/requestUtils");
const User = require("../models/user");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header --> DONE
  const credentials = getCredentials(request);
  if (!credentials || credentials.length < 2) return null;
  const user = await User.findOne({email: credentials[0]}).exec();
  if (!user) return null;
  const passwordValidation = await user.checkPassword(credentials[1]);
  return passwordValidation ? user : null;
};

module.exports = { getCurrentUser };

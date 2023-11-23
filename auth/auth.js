const { getCredentials } = require("../utils/requestUtils");
const User = require("../models/user");

/**
 * Get the current user based on the "Authorization" request header.
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request object.
 * @returns {Promise<User|null>} A Promise that resolves to the current user or null if not found.
 *
 * @throws {Error} Throws an error if there's an issue with fetching the user or checking the password.
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

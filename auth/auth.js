const { getCredentials } = require("../utils/requestUtils");
const { getUser } = require("../utils/users");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header --> DONE
  const credentials = getCredentials(request);
  const currentUser =
    credentials && credentials.length === 2 && getUser(...credentials);
  return currentUser;
};

module.exports = { getCurrentUser };

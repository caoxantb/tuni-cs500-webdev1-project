const User = require("../models/user");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

/**
 * Send all users as JSON.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with fetching users from the database.
 */
const getAllUsers = async (response) => {
  const users = await User.find({}).exec();
  return sendJson(response, users);
};

/**
 * Delete a user and send the deleted user as JSON.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {string} userId - The ID of the user to be deleted.
 * @param {object} currentUser - The current user object (mongoose document).
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with fetching, deleting, or sending the user.
 */
const deleteUser = async (response, userId, currentUser) => {
  if (userId === currentUser.id) return badRequest(response, "400 Bad Request");
  const user = await User.findById(userId).exec();
  if (!user) return notFound(response, "404 Not Found");
  await User.deleteOne({ _id: userId }).exec();
  return sendJson(response, user);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {string} userId - The ID of the user to be updated
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
  if (!userData.role || !["customer", "admin"].includes(userData.role))
    return badRequest(response, "400 Bad Request");
  if (userId === currentUser.id) {
    return badRequest(response, "Updating own data is not allowed");
  }
  await User.findByIdAndUpdate(userId, { role: userData.role }).exec();
  const user = await User.findById(userId).exec();
  return user ? sendJson(response, user) : notFound(response, "404 Not Found");
};

/**
 * Update a user's role and send the updated user as JSON.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {string} userId - The ID of the user to be updated.
 * @param {object} currentUser - The current user object (mongoose document).
 * @param {object} userData - The updated user data, including the new role.
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with updating, fetching, or sending the user.
 */
const viewUser = async (response, userId, currentUser) => {
  const user = await User.findById({ _id: userId }).exec();
  return user ? sendJson(response, user) : notFound(response, "404 Not Found");
};

/**
 * Register a new user and send the created user as JSON.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {object} userData - The user data for registration, including the password.
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with validating, creating, or sending the user.
 */
const registerUser = async (response, userData) => {
  try {
    if (userData.password.length < 10)
      return badRequest(response, "400 Bad Request");
    const newUser = new User({ ...userData, role: "customer" });
    await newUser.save();
    return sendJson(response, newUser, 201);
  } catch (e) {
    return badRequest(response, "400 Bad Request");
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  deleteUser,
  viewUser,
  updateUser,
};

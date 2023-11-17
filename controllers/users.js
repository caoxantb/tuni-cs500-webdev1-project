const User = require("../models/user");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllUsers = async (response) => {
  const users = await User.find({}).exec();
  return sendJson(response, users);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async (response, userId, currentUser) => {
  if (userId === currentUser._id)
    return badRequest(response, "400 Bad Request");
  const user = await User.findById(userId).exec();
  if (!user) return notFound(response, "404 Not Found");
  await User.deleteOne({ _id: userId }).exec();
  return sendJson(response, user);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
  if (
    !userData.role ||
    !["customer", "admin"].includes(userData.role) ||
    userId === currentUser._id
  )
    return badRequest(response, "400 Bad Request");
  await User.findByIdAndUpdate(userId, { role: userData.role }).exec();
  const user = await User.findById(userId).exec();
  return user ? sendJson(response, user) : notFound(response, "404 Not Found");
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
  const user = await User.findById({ _id: userId }).exec();
  return user ? sendJson(response, user) : notFound(response, "404 Not Found");
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */

const registerUser = async (response, userData) => {
  try {
    const newUser = new User({ ...userData, role: "customer" });
    await newUser.save();
    return sendJson(response, newUser, 201);
  } catch (e) {
    badRequest(response, "400 Bad Request");
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  deleteUser,
  viewUser,
  updateUser,
};

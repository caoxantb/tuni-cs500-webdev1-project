const Order = require("../models/order");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

/**
 * Get orders based on the user's role.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {User} currentUser - The current user object.
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with fetching orders from the database.
 */
const getOrders = async (response, currentUser) => {
  if (currentUser.role === "admin") {
    const orders = await Order.find({}).exec();
    return sendJson(response, orders);
  } else {
    const orders = await Order.find({ customerId: currentUser._id }).exec();
    return sendJson(response, orders);
  }
};

/**
 * View order data as JSON.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {string} orderId - The ID of the order to view.
 * @param {User} currentUser - The current user object (mongoose document).
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with fetching the order from the database.
 */
const viewOrder = async (response, orderId, currentUser) => {
  if (currentUser.role === "admin") {
    const order = await Order.findById({ _id: orderId }).exec();
    return order
      ? sendJson(response, order)
      : notFound(response, "404 Not Found");
  } else {
    const order = await Order.findOne({
      _id: orderId,
      customerId: currentUser._id,
    }).exec();
    return order
      ? sendJson(response, order)
      : notFound(response, "404 Not Found");
  }
};

/**
 * Create a new order and send the created order back as JSON.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @param {User} orderData - JSON data from the request body representing the new order.
 * @param {User} currentUser - The current user object (mongoose document).
 * @returns {Promise<void>} A Promise that resolves after sending the JSON response.
 *
 * @throws {Error} Throws an error if there's an issue with creating or saving the order.
 */
const createOrder = async (response, orderData, currentUser) => {
  try {
    if (
      orderData.items.length === 0 ||
      orderData.items.some((item) => {
        return !item.product.name || !item.product.price;
      })
    ) {
      return badRequest(response, "400 Bad Request");
    }

    const newOrder = new Order({ ...orderData, customerId: currentUser._id });
    await newOrder.save();
    return sendJson(response, newOrder, 201);
  } catch (e) {
    return badRequest(response, "400 Bad Request");
  }
};

module.exports = {
  getOrders,
  viewOrder,
  createOrder,
};

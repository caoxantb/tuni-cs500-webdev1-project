const Order = require("../models/order");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

/**
 * Send all orders as JSON according to User's role
 *
 * @param {http.ServerResponse} response
 * @param {Object} currentUser (mongoose document object)
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
 * Send order data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} orderId
 * @param {Object} currentUser (mongoose document object)
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
 * Create a new order and send created order back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} orderData JSON data from request body
 * @param {Object} currentUser (mongoose document object)
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

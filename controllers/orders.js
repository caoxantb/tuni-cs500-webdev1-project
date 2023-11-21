const Order = require("../models/order");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");
const { getCurrentUser } = require("../auth/auth");

const getOrders = async (response, currentUSer) => {
  //const currentUser = await getCurrentUser(request);
  if (currentUSer.role === "admin") {
    const orders = await Order.find({}).exec();
    return sendJson(response, orders);
  } else {
    const orders = await Order.find({ customerId: currentUSer._id }).exec();
    return sendJson(response, orders);
  }
};

const viewOrder = async (response, orderId, currentUser) => {
  if (currentUser.role === "admin") {
    const order = await Order.findById({ _id: orderId }).exec();
    return order ? sendJson(response, order) : notFound(response, "404 Not Found");
  } else {
    const order = await Order.findOne({ _id: orderId, customerId: currentUser._id }).exec();
    return order ? sendJson(response, order) : notFound(response, "404 Not Found");
  }
};

module.exports = {
  getOrders,
  viewOrder
};
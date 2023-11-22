const Order = require("../models/order");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

const getOrders = async (response, currentUser) => {
  if (currentUser.role === "admin") {
    const orders = await Order.find({}).exec();
    return sendJson(response, orders);
  } else {
    const orders = await Order.find({ customerId: currentUser._id }).exec();
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

const createOrder = async (response, orderData, currentUser) => {
  try {
    if (orderData.items.length === 0 || 
        orderData.items.some((item) => { return !item.product.name || !item.product.price })) {
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
  createOrder
};
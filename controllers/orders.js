const Order = require("../models/order");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

const getAllOrders = async (response, currentUser) => {
  const query =
    currentUser.role === "admin"
      ? {}
      : { customerId: currentUser._id.toString() };
  const orders = await Order.find(query).exec();
  return sendJson(response, orders);
};

const getOrderById = async (response, orderId, currentUser) => {
  const order = await Order.findById(orderId).exec();
  return !order ||
    (currentUser.role === "customer" &&
      order.customerId.toString() !== currentUser._id.toString())
    ? notFound(response, "404 Not Found")
    : sendJson(response, order);
};

const createOrder = async (response, data, currentUser) => {
  try {
    if (
      !data.items.length ||
      data.items.some(
        (item) =>
          item.product.name === undefined || item.product.price === undefined
      )
    )
      return badRequest(response, "400 Bad Request");

    const newOrder = new Order({
      ...data,
      customerId: currentUser._id.toString(),
    });
    await newOrder.save();
    return sendJson(response, newOrder, 201);
  } catch (e) {
    return badRequest(response, "400 Bad Request");
  }
};

module.exports = { getAllOrders, getOrderById, createOrder };

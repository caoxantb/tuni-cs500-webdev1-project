const Product = require("../models/product");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async (response) => {
  const products = await Product.find({}).exec();
  return sendJson(response, products);
};

const getProductById = async (response, productId) => {
  const product = await Product.findById({ _id: productId }).exec();
  return product
    ? sendJson(response, product)
    : notFound(response, "404 Not Found");
};

const createProduct = async (response, data) => {
  try {
    const newProduct = new Product({ ...data });
    await newProduct.save();
    return sendJson(response, newProduct, 201);
  } catch (e) {
    return badRequest(response, "400 Bad Request");
  }
};

const updateProductById = async (response, productId, currentUser, data) => {
  const { name, price } = data;
  if (!name?.length || isNaN(price) || price <= 0)
    return badRequest(response, "400 Bad Request");

  await Product.findByIdAndUpdate(productId, { ...data }).exec();
  const product = await Product.findById(productId).exec();
  return product
    ? sendJson(response, product)
    : notFound(response, "404 Not Found");
};

const deleteProduct = async (response, productId, currentUser) => {
  const product = await Product.findById(productId).exec();
  if (!product) return notFound(response, "404 Not Found");
  await Product.deleteOne({ _id: productId }).exec();
  return sendJson(response, product);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProduct,
};

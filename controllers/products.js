const Product = require("../models/product");
const { sendJson, badRequest, notFound } = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response the http response
 */
const getAllProducts = async (response) => {
  const products = await Product.find({}).exec();
  return sendJson(response, products);
};

/**
 * Add new product and send created product back as JSON
 *
 * @typedef {import('http').ServerResponse} ServerResponse
 * @param {ServerResponse} response the http response
 * @param {object} productData JSON data from request body
 */
const createProduct = async (response, productData) => {
  try {
    const newProduct = new Product({...productData});
    await newProduct.save();
    return sendJson(response, newProduct, 201);
  } catch (error) {
    return badRequest(response, "400 Bad Request");
  }
};

/**
 * Delete a product with the given ID.
 *
 * @param {http.ServerResponse} response response of function
 * @param {object} productData JSON data from request body
 */
const deleteProduct = async (response, productID) => {
  const productToDelete = await Product.findOne({ _id : productID }).exec();
  
  if (!productToDelete) {
    return notFound(response);
  }

  try {
    await Product.deleteOne({_id : productID}).exec();
    return sendJson(response, productToDelete);
  } catch (error) {
    return badRequest(response, "400 Bad Request");
  }
};

/**
 * Sends a product according to the id as JSON
 * 
 * @param {http.ServerResponse} response response of function
 * @param {string} productID id of viewed product
 * @returns return bad-request or informative response
 */
const viewProduct = async (response, productID) => {
  const product = await Product.findOne({ _id : productID}).exec();

  if (!product) return notFound(response);
  return sendJson(response, product);
};

/**
 * Updates a product according to the id as JSON
 * 
 * @param {http.ServerResponse} response respionse of function
 * @param {string} productID id of product to update
 * @param {object} productData JSON data from request body
 */
const updateProduct = async (response, productID, productData) => {
  try {
    const { name, price } = productData;
    if (!name?.length || isNaN(price) || price <= 0) {
      return badRequest(response, "400 Bad Request");
    }
    
    await Product.findByIdAndUpdate(productID, { ...productData }).exec();
    const product = await Product.findById(productID).exec();
    if (!product) return notFound(response);
    return sendJson(response, product);
  } catch (error) {
    return badRequest(response, "400 Bad Request");
  }
};

module.exports = { getAllProducts, createProduct, deleteProduct, viewProduct, updateProduct };

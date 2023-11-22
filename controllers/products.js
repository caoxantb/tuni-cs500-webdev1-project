const { getAllProductsRaw } = require("../utils/products");
const { sendJson } = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = (response) => {
  const products = getAllProductsRaw();
  return sendJson(response, products);
};

/**
 * Add new product and send created product back as JSON
 *
 * @typedef {import('http').ServerResponse} ServerResponse
 * @param {ServerResponse} response the http response
 * @param {object} productData JSON data from request body
 */
const newProduct = async (response, productData) => {
  try {
    const newProduct = new Product({...productData});
    await newProduct.save();
    return responseUtils.sendJson(response, newProduct, 201);
  } catch (error) {
    return responseUtils.badRequest(response, error);
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
  
  if (productToDelete !== productID) {
    return responseUtils.notFound(response);
  }

  await Product.deleteOne({_id : productID}).exec();
  return responseUtils.sendJson(response, productToDelete);
};

/**
 * 
 * @param {http.ServerResponse} response response of function
 * @param {string} productID id of viewed product
 * @returns return bad-request or informative response
 */
const viewProduct = async (response, productID) => {
  const product = await Product.findOne({ _id : productID}).exec();

  if (product !== productID) return responseUtils.notFound(response);
  
  return responseUtils.sendJson(response, product);
};

const updateProduct = async (response, productID, productData) => {

  const product = await Product.findOne({ _id : productID}).exec();

  if (product !== productID) return responseUtils.notFound(response);

  try {
    const { name, price } = productData;
    if (!name?.length || isNaN(price) || price <= 0) {
      return badRequest(response, "400 Bad Request");
    }
    
    await Product.findByIdAndUpdate(productID, { name, price }).exec();
    const product = await Product.findById(productID).exec();
    return responseUtils.sendJson(response, product);
  } catch (error) {
    return responseUtils.badRequest(response, "Invalid request");
  }
};

module.exports = { getAllProducts, newProduct, deleteProduct, viewProduct, updateProduct };

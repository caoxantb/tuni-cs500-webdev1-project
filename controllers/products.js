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

module.exports = { getAllProducts };

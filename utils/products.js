const products = require("../products.json").map((product) => ({ ...product }));

const getAllProductsRaw = () => products.map((product) => ({ ...product }));

module.exports = { getAllProductsRaw };

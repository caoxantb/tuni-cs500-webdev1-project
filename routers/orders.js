const { getCurrentUser } = require("../auth/auth");
const { isJson, parseBodyJson, acceptsJson } = require("../utils/requestUtils");
const {
  basicAuthChallenge,
  forbidden,
  badRequest,
  contentTypeNotAcceptable,
} = require("../utils/responseUtils");
const {
  getAllOrders,
  getOrderById,
  createOrder,
} = require("../controllers/orders");

const get = async (path, request, response) => {
  if (!acceptsJson(request)) {
    return contentTypeNotAcceptable(response);
  }
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return basicAuthChallenge(response);

  const pathArr = path.split("/");
  if (pathArr.length === 4) {
    return await getOrderById(response, pathArr[3], currentUser);
  } else if (pathArr.length === 3) {
    return await getAllOrders(response, currentUser);
  }
  return badRequest(response, "400 Bad Request");
};

// const post = async (path, request, response) => {
//   if (!acceptsJson(request)) {
//     return contentTypeNotAcceptable(response);
//   }
//   if (!isJson(request)) {
//     return badRequest(
//       response,
//       "Invalid Content-Type. Expected application/json"
//     );
//   }
//   const currentUser = await getCurrentUser(request);
//   if (!currentUser) return basicAuthChallenge(response);
//   if (currentUser.role !== "admin") return forbidden(response);

//   const product = await parseBodyJson(request);
//   return await createProduct(response, product);
// };

const post = async (path, request, response) => {
  if (!acceptsJson(request)) {
    return contentTypeNotAcceptable(response);
  }
  if (!isJson(request)) {
    return badRequest(
      response,
      "Invalid Content-Type. Expected application/json"
    );
  }
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return basicAuthChallenge(response);
  if (currentUser.role !== "customer") return forbidden(response);

  const order = await parseBodyJson(request);
  return await createOrder(response, order, currentUser);
};

const orderRouter = { get, post };

module.exports = orderRouter;

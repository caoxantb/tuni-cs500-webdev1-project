const { getCurrentUser } = require("../auth/auth");
const { getOrders, viewOrder, createOrder } = require("../controllers/orders");
const { isJson, parseBodyJson, acceptsJson } = require("../utils/requestUtils");
const {
  basicAuthChallenge,
  forbidden,
  badRequest,
  contentTypeNotAcceptable,
} = require("../utils/responseUtils");

const get = async (path, request, response) => {
  if (!acceptsJson(request)) {
    return contentTypeNotAcceptable(response);
  }
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return basicAuthChallenge(response);

  const pathArr = path.split("/");
  if (pathArr.length === 3) {
    return await getOrders(response, currentUser);
  } else if (pathArr.length === 4) {
    return await viewOrder(response, pathArr[3], currentUser);
  }
  return badRequest(response, "400 Bad Request");
};

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
  if (currentUser.role === "admin") return forbidden(response);

  const order = await parseBodyJson(request);
  return await createOrder(response, order, currentUser);
};

const orderRouter = { get, post };

module.exports = orderRouter;

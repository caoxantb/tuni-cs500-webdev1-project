const { getCurrentUser } = require("../auth/auth");
const {
  getOrders,
  viewOrder
} = require("../controllers/orders");
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

const orderRouter = { get };

module.exports = orderRouter;
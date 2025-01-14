const responseUtils = require("./utils/responseUtils");
const { renderPublic } = require("./utils/render");
const userRouter = require("./routers/users");
const productRouter = require("./routers/products");
const orderRouter = require("./routers/orders");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  "/api/register": ["POST"],
  "/api/users": ["GET"],
  "/api/users/:userId": ["GET", "PUT", "DELETE"],
  "/api/products": ["GET", "POST"],
  "/api/products/:productId": ["GET", "PUT", "DELETE"],
  "/api/orders": ["GET", "POST"],
  "/api/orders/:orderId": ["GET"],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @returns {void} - This function does not return a value explicitly.
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      "Access-Control-Allow-Methods": allowedMethods[filePath].join(","),
      "Access-Control-Allow-Headers": "Content-Type,Accept",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Expose-Headers": "Content-Type,Accept",
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix model path
 * @returns {boolean} if id is valid for model
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = "[0-9a-z]{8,24}";
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

const matchBaseFilePath = (url, prefix) => {
  return matchIdRoute(url, prefix)
    ? `/api/${prefix}/:${prefix.slice(0, -1)}Id`
    : url;
};

const config = (response, method, filePath) => {
  // serve static files from public/ and return immediately
  if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
    const fileName =
      filePath === "/" || filePath === "" ? "index.html" : filePath;
    return renderPublic(fileName, response);
  }

  const filePathArr = filePath.split("/");
  if (filePathArr.length < 3) return responseUtils.notFound(response);
  const filePathBase = matchBaseFilePath(filePath, filePathArr[2]);

  // Default to 404 Not Found if unknown url
  if (!(filePathBase in allowedMethods))
    return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === "OPTIONS")
    return sendOptions(filePathBase, response);

  // Check for allowable methods
  if (!allowedMethods[filePathBase].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  return true;
};

/**
 * Handles incoming HTTP requests by routing them to the appropriate handler.
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request object.
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @returns {Promise<void>} A Promise that resolves when the request handling is complete.
 *
 * @throws {Error} Throws an error if the request cannot be handled.
 */
const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  const res = config(response, method, filePath);
  if (res !== true) return res;

  const filePathArr = filePath.split("/");
  const router = ["users", "register"].includes(filePathArr[2])
    ? userRouter
    : filePathArr[2] === "products"
    ? productRouter
    : filePathArr[2] === "orders"
    ? orderRouter
    : undefined;

  switch (method.toUpperCase()) {
    case "GET":
      return await router.get(filePath, request, response);
    case "POST":
      return await router.post(filePath, request, response);
    case "PUT":
      return await router.put(filePath, request, response);
    case "DELETE":
      return await router.remove(filePath, request, response);
    default:
      return responseUtils.methodNotAllowed(response);
  }
};

module.exports = { handleRequest };

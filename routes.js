const responseUtils = require("./utils/responseUtils");
const { acceptsJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const { getCurrentUser } = require("./auth/auth");
const { getAllProducts } = require("./controllers/products");
const userRouter = require("./routers/users");

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
 * @param {http.ServerResponse} response
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
 * @param {string} prefix
 * @returns {boolean}
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

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

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

  if (["users", "register"].includes(filePathArr[2])) {
    switch (method.toUpperCase()) {
      case "GET":
        return await userRouter.get(filePath, request, response);
      case "POST":
        return await userRouter.post(filePath, request, response);
      case "PUT":
        return await userRouter.put(filePath, request, response);
      case "DELETE":
        return await userRouter.remove(filePath, request, response);
      default:
        return responseUtils.methodNotAllowed(response);
    }
  }

  // read all products
  if (filePath === "/api/products" && method.toUpperCase() === "GET") {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return responseUtils.basicAuthChallenge(response);
    if (["customer", "admin"].includes(currentUser.role)) {
      return getAllProducts(response);
    }
    return responseUtils.forbidden(response);
  }
};

module.exports = { handleRequest };

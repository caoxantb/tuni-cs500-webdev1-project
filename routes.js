const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const { getCurrentUser } = require("./auth/auth");
const { getAllProducts } = require("./controllers/products");
const User = require("./models/user");
const { getAllUsers, registerUser, deleteUser, updateUser, viewUser } = require("./controllers/users");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  "/api/register": ["POST"],
  "/api/users": ["GET"],
  "/api/products": ["GET"],
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

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = (url) => {
  return matchIdRoute(url, "users");
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

  if (matchUserId(filePath)) {
    // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE) --> DONE
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return responseUtils.basicAuthChallenge(response);
    else if (currentUser.role !== "admin")
      return responseUtils.forbidden(response);

    const filePathArr = filePath.split("/");
    let user, body;

    if (filePathArr.length === 4) {
      switch (method.toUpperCase()) {
        case "OPTIONS":
          return sendOptions(filePath, response);
        case "GET":
          return await viewUser(response, filePathArr[3], currentUser);
        case "PUT":
          body = await parseBodyJson(request);
          return await updateUser(response, filePathArr[3], currentUser, body);
        case "DELETE":
          return await deleteUser(response, filePathArr[3], currentUser);
        default:
          return responseUtils.methodNotAllowed(response);
      }
    }
    responseUtils.badRequest(response, "400 Bad Request");
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === "OPTIONS")
    return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === "/api/users" && method.toUpperCase() === "GET") {
    // TODO: 8.5 Add authentication (only allowed to users with role "admin") --> DONE
    const user = await getCurrentUser(request);
    if (!user) {
      return responseUtils.basicAuthChallenge(response);
    } else if (user.role === "customer") {
      return responseUtils.forbidden(response);
    }
    return await getAllUsers(response);
  }

  // register new user
  if (filePath === "/api/register" && method.toUpperCase() === "POST") {
    // Fail if not a JSON request, don't allow non-JSON Content-Type
    if (!isJson(request)) {
      return responseUtils.badRequest(
        response,
        "Invalid Content-Type. Expected application/json"
      );
    }
    // TODO: 8.4 Implement registration --> DONE
    // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
    const user = await parseBodyJson(request);
    return await registerUser(response, user);
  }

  // read all products
  if (filePath === "/api/products" && method.toUpperCase() === "GET") {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return responseUtils.basicAuthChallenge(response);
    if (["customer", "admin"].includes(currentUser.role)) {
      return getAllProducts(response);
    }
    return responseUtils.forbidden(response);
    // return getAllProducts(request, response);
  }
};

module.exports = { handleRequest };

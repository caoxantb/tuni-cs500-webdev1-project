const { getCurrentUser } = require("../auth/auth");
const {
  viewUser,
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const { isJson, parseBodyJson, acceptsJson } = require("../utils/requestUtils");
const { basicAuthChallenge, forbidden, badRequest, contentTypeNotAcceptable } = require("../utils/responseUtils");


const get = async (path, request, response) => {
  if (!acceptsJson(request)) {
    return contentTypeNotAcceptable(response);
  }
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return basicAuthChallenge(response);
  if (currentUser.role !== "admin") return forbidden(response);

  const pathArr = path.split("/");
  if (pathArr.length === 4) {
    return await viewUser(response, pathArr[3], currentUser);
  } else if (pathArr.length === 3) {
    return await getAllUsers(response);
  }
  return responseUtils.badRequest(response, "400 Bad Request");
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
  const user = await parseBodyJson(request);
  return await registerUser(response, user);
};

const put = async (path, request, response) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return basicAuthChallenge(response);
  if (currentUser.role !== "admin") return forbidden(response);
  if (!acceptsJson(request)) {
    return contentTypeNotAcceptable(response);
  }

  const pathArr = path.split("/");
  if (pathArr.length === 4) {
    const body = await parseBodyJson(request);
    return await updateUser(response, pathArr[3], currentUser, body);
  }
  return badRequest(response, "400 Bad Request");
};

const remove = async (path, request, response) => {
  if (!acceptsJson(request)) {
    return contentTypeNotAcceptable(response);
  }
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return basicAuthChallenge(response);
  if (currentUser.role !== "admin") return forbidden(response);

  const pathArr = path.split("/");
  if (pathArr.length === 4) {
    return await deleteUser(response, pathArr[3], currentUser);
  }
  return badRequest(response, "400 Bad Request");
};

const userRouter = { get, post, put, remove };

module.exports = userRouter;
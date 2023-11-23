const { getCurrentUser} = require("../auth/auth");
const {
    getAllProducts,
    createProduct,
    deleteProduct,
    viewProduct,
    updateProduct,
} = require("../controllers/products");
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
    if (pathArr.length === 4) {
        return await viewProduct(response, pathArr[3]);
    } else if (pathArr.length === 3) {
        return await getAllProducts(response);
    }
    return badRequest(response, "400 Bad Request");
};

const post = async (path, request, response) => {
    if (!acceptsJson(request)) {
        return contentTypeNotAcceptable(response);
    }
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return basicAuthChallenge(response);
    if (currentUser.role !== "admin") return forbidden(response);
    if (!isJson(request)) {
        return badRequest(
            response,
            "Invalid Content-Type. Expected application/json"
        );
    }
    const product = await parseBodyJson(request);
    return await createProduct(response, product);
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
        return await updateProduct(response, pathArr[3], body);
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
        return await deleteProduct(response, pathArr[3]);
    }
    return badRequest(response, "400 Bad Request");
};

const productRouter = { get, post, put, remove };

module.exports = productRouter;

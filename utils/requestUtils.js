/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request object.
 * @returns {Array|null} array [username, password] from Authorization header, or null if header is missing
 */
const getCredentials = (request) => {
  // TODO: 8.5 Parse user credentials from the "Authorization" request header --> DONE
  // NOTE: The header is base64 encoded as required by the http standard.
  //       You need to first decode the header back to its original form ("email:password").
  //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
  //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.substring(0, 5).toLowerCase() === "basic") {
    const authToken = authHeader.substring(6);
    const credentials = Buffer.from(authToken, "base64").toString().split(":");
    return credentials;
  }
  return null;
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request object.
 * @returns {boolean} if client accept JSON responses
 */
const acceptsJson = (request) => {
  //Check if the client accepts JSON as a response based on "Accept" request header
  // NOTE: "Accept" header format allows several comma separated values simultaneously
  // as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
  // Do not rely on the header value containing only single content type!
  const acceptHeader = request.headers.accept || "";
  return (
    acceptHeader.includes("application/json") || acceptHeader.includes("*/*")
  );
};

/**
 * Is the client request content type JSON? Return true if it is.
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request object.
 * @returns {boolean} if client request type is JSON
 */
const isJson = (request) => {
  // TODO: 8.4 Check whether request "Content-Type" is JSON or not --> DONE
  const contentTypeHeader = request.headers["content-type"];
  return contentTypeHeader
    ? contentTypeHeader.includes("application/json")
    : false;
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request - The incoming HTTP request object.
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = (request) => {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("error", (err) => reject(err));

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };

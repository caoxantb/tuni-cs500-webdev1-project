const path = require('path');
const fs = require('fs');

const NOT_FOUND_TEMPLATE = path.resolve(__dirname, '../public/404.html');

/**
 * Render a public file based on the provided file path.
 *
 * @param {string} filePath - The file path to be rendered.
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @returns {void} - This function does not return a value explicitly.
 */
const renderPublic = (filePath, response) => {
  if (!filePath) return renderNotFound(response);

  const [filename, ext] = splitPath(filePath);
  const contentType = getContentType(ext);
  const fullPath = getFullFilePath(filePath);

  if (!fullPath) return renderNotFound(response);
  renderFile(fullPath, contentType, response);
};

/**
 * Render a "Not Found" response using a predefined template.
 *
 * @param {http.ServerResponse} response - The HTTP server response object.
 * @returns {void} - This function does not return a value explicitly.
 */
const renderNotFound = response => {
  renderFile(NOT_FOUND_TEMPLATE, getContentType('html'), response);
};

/**
 * Get the content type based on the provided file extension.
 *
 * @param {string} fileExtension - The file extension used to determine the content type.
 * @returns {string} - The content type corresponding to the file extension.
 */
const getContentType = fileExtension => {
  let contentType = 'text/html';

  switch (fileExtension.toLowerCase().replace('.', '')) {
    case 'js':
      contentType = 'text/javascript';
      break;
    case 'css':
      contentType = 'text/css';
      break;
    case 'json':
      contentType = 'application/json';
      break;
    case 'png':
      contentType = 'image/png';
      break;
    case 'jpg':
      contentType = 'image/jpg';
      break;
    case 'svg':
      contentType = 'image/svg+xml';
      break;
    case 'wav':
      contentType = 'audio/wav';
      break;
    default:
      contentType = 'text/html';
  }

  return contentType;
};

const renderFile = (filePath, contentType, response) => {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.statusCode = 500;
      if (error.code === 'ENOENT') {
        // console.error(`File does not exist: ${filePath}`);
        response.statusCode = 404;
        if (filePath !== NOT_FOUND_TEMPLATE) return renderNotFound(response);
      } else if (error.code === 'EACCES') {
        console.error(`Cannot read file: ${filePath}`);
      } else {
        console.error(
          'Failed to read file: %s. Received the following error: %s: %s ',
          filePath,
          error.code,
          error.message
        );
      }

      return response.end();
    }

    const status = filePath !== NOT_FOUND_TEMPLATE ? 200 : 404;
    response.writeHead(status, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  });
};

const getFullFilePath = fileName => {
  const basePath = 'public';
  return path.resolve(
    __dirname,
    `../${basePath}/${fileName[0] === '/' ? fileName.substring(1) : fileName}`
  );
};

const splitPath = filePath => {
  const tmpPath = filePath.split('?')[0];
  const filename = path.basename(tmpPath);
  const ext = path.extname(filename);
  return [filename, ext];
};

module.exports = { renderPublic, renderNotFound, getContentType };

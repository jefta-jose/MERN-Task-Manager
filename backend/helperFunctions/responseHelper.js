const sendResponse = (res, statusCode, data = null, message = null, success = true) => {
    res.status(statusCode).json({
        success,
        message,
        data,
    });
};

// Common shortcuts
const ok = (res, data, message = "Success") => sendResponse(res, 200, data, message, true);
const created = (res, data, message = "Created") => sendResponse(res, 201, data, message, true);
const badRequest = (res, message = "Bad Request") => sendResponse(res, 400, null, message, false);
const unauthorized = (res, message = "Unauthorized") => sendResponse(res, 401, null, message, false);
const forbidden = (res, message = "Forbidden") => sendResponse(res, 403, null, message, false);
const notFound = (res, message = "Not Found") => sendResponse(res, 404, null, message, false);
const serverError = (res, error) => sendResponse(res, 500, null, error.message || "Server Error", false);

module.exports = {
    sendResponse,
    ok,
    created,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    serverError,
};
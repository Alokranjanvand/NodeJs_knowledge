const { v4: uuid } = require('uuid');

// Define the ERROR_CODE enum
exports.ERROR_CODE = {
  DEFAULT: 400,
  UNAUTHORISE: 401,
  FAILED: 400,
  FORBIDDEN_403:403,
  EXCEPTION: 500,
  INVALIDREQUEST: 400,
  CONTESTNOTFOUND: 404,
  INSUFFICIENTBALANCE: 402,
  CLIENT_OUTDATED: 426,
  RESYNC: 409,
  OK: 200,
  EARLY_PRESENCE: 412,
  SERVER_MAINTENANCE: 503,
  DATA_EXPIRED: 410,
  SERVER_BUSY: 503,
  SERVER_ERROR:500
};


// BaseHttpResponse function
exports.BaseHttpResponse = (data = null, error = null, statusCode = 400, timestamp = Date.now(), msgUuid = uuid()) => {
  return { data, error, statusCode, timestamp, msgUuid };
};

// Success Response Function
exports.successResponse = (data, statusCode = ERROR_CODE.OK) => {
  return this.BaseHttpResponse(data, null, statusCode);
};

// Failed Response Function
exports.failedResponse = (msg, statusCode = ERROR_CODE.DEFAULT) => {
  return this.BaseHttpResponse(null, msg, statusCode);
};

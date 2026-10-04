const ApiError = require('../utils/ApiError');

// validate(schema, 'body' | 'query' | 'params')
module.exports = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, ''),
    }));
    return next(ApiError.unprocessable('Validation failed', details));
  }
  if (source === 'query') {
    Object.defineProperty(req, 'query', { value, writable: true, configurable: true });
  } else {
    req[source] = value;
  }
  return next();
};

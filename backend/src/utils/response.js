const success = (res, data = {}, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Created successfully') => success(res, data, message, 201);

module.exports = { success, created };

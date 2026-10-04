// Removes keys starting with "$" or containing "." to block NoSQL operator injection.
function clean(obj) {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === 'object') {
    const out = {};
    Object.keys(obj).forEach((k) => {
      if (k.startsWith('$') || k.includes('.')) return;
      out[k] = clean(obj[k]);
    });
    return out;
  }
  return obj;
}

module.exports = (req, _res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query) {
    const cleaned = clean(req.query);
    Object.defineProperty(req, 'query', { value: cleaned, writable: true, configurable: true });
  }
  next();
};

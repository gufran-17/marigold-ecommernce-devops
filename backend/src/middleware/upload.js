const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

// Memory storage: the imageStorage service decides where the file finally goes (disk now, S3 later).
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) return cb(ApiError.badRequest('Only JPG, PNG or WEBP images are allowed'));
    return cb(null, true);
  },
});

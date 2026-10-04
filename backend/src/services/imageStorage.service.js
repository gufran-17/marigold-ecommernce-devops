// Image storage layer. Today: local disk. Later: swap this file for an S3 version
// exposing the same two functions (saveImage, deleteImage) and nothing else changes.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

const uploadRoot = path.resolve(process.cwd(), env.uploadDir);
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

async function saveImage(file) {
  await fs.promises.mkdir(uploadRoot, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[file.mimetype] || '.jpg'}`;
  await fs.promises.writeFile(path.join(uploadRoot, name), file.buffer);
  return `${env.publicUrl}/uploads/${name}`;
}

async function deleteImage(url) {
  const name = path.basename(String(url));
  if (!url || !String(url).includes('/uploads/')) return;
  await fs.promises.unlink(path.join(uploadRoot, name)).catch(() => {});
}

module.exports = { saveImage, deleteImage, uploadRoot };

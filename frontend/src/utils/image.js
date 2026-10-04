const apiUrl = import.meta.env.VITE_API_URL || '/api';
const origin = /^https?:\/\//.test(apiUrl) ? new URL(apiUrl).origin : '';

// Product images are stored as "/uploads/..." paths. Prefix the API origin when the API is on another host.
export const imageUrl = (url) => {
  if (!url) return '/favicon.svg';
  if (/^https?:\/\//.test(url)) return url;
  return `${origin}${url}`;
};

export const firstImage = (product) => imageUrl(product && product.images && product.images[0] && product.images[0].url);

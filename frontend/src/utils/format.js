export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

export const formatDate = (d, withTime = false) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });

export const PAYMENT_LABELS = { COD: 'Cash on Delivery', MOCK_CARD: 'Card (mock)', MOCK_UPI: 'UPI (mock)' };

export const STATUS_STYLES = {
  Pending: 'bg-marigold-light text-[#7A5A00]',
  Confirmed: 'bg-blue-50 text-blue-700',
  Processing: 'bg-indigo-50 text-indigo-700',
  Shipped: 'bg-cyan-50 text-cyan-700',
  Delivered: 'bg-brand-light text-brand-dark',
  Cancelled: 'bg-sale-light text-sale',
  Paid: 'bg-brand-light text-brand-dark',
  Failed: 'bg-sale-light text-sale',
  Refunded: 'bg-surface-alt text-ink-soft',
};

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  (err && err.response && err.response.data && err.response.data.message) || (err && err.message) || fallback;

export const fieldErrors = (err) => {
  const details = err && err.response && err.response.data && err.response.data.error && err.response.data.error.details;
  if (!Array.isArray(details)) return {};
  return Object.fromEntries(details.map((d) => [d.field, d.message]));
};

// Payment provider abstraction. All methods are MOCK for now.
// To add a real gateway (Razorpay, Stripe...), implement the same `charge` signature
// and return { status, reference }. Order code does not need to change.
const crypto = require('crypto');

const providers = {
  COD: async () => ({ status: 'Pending', reference: '' }),
  MOCK_CARD: async ({ details }) => {
    const digits = String((details && details.cardNumber) || '').replace(/\s/g, '');
    // Mock rule: card ending in 0000 fails, so the failure path can be tested.
    if (!/^\d{12,19}$/.test(digits)) return { status: 'Failed', reference: '' };
    if (digits.endsWith('0000')) return { status: 'Failed', reference: '' };
    return { status: 'Paid', reference: `MOCKCARD-${crypto.randomBytes(5).toString('hex').toUpperCase()}` };
  },
  MOCK_UPI: async ({ details }) => {
    const upi = String((details && details.upiId) || '');
    if (!/^[\w.-]{2,}@[\w]{2,}$/.test(upi)) return { status: 'Failed', reference: '' };
    return { status: 'Paid', reference: `MOCKUPI-${crypto.randomBytes(5).toString('hex').toUpperCase()}` };
  },
};

exports.charge = async ({ method, amount, details }) => {
  const provider = providers[method];
  if (!provider) throw new Error(`Unsupported payment method: ${method}`);
  return provider({ amount, details });
};

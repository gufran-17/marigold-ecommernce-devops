const env = require('../config/env');

const round2 = (n) => Math.round(n * 100) / 100;

// items: [{ product (doc with price/finalPrice), quantity }]
exports.calculate = (items) => {
  let listTotal = 0;
  let itemsTotal = 0;
  items.forEach(({ product, quantity }) => {
    listTotal += product.price * quantity;
    itemsTotal += product.finalPrice * quantity;
  });
  const discount = listTotal - itemsTotal;
  const shippingFee = items.length === 0 || itemsTotal >= env.freeShippingThreshold ? 0 : env.shippingFee;
  return {
    listTotal: round2(listTotal),
    itemsTotal: round2(itemsTotal),
    discount: round2(discount),
    shippingFee,
    totalAmount: round2(itemsTotal + shippingFee),
    freeShippingThreshold: env.freeShippingThreshold,
  };
};

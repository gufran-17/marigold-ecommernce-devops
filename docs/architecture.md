# Architecture notes

## Layers (backend)
routes → controllers → services → models. Controllers stay thin (validate input already
done by middleware, call a service or model, shape the response). Business logic that
touches more than one model (placing an order, recalculating a rating) lives in `services/`.

## Why data is duplicated in orders
`Order.items` copies each product's name, image and price at the time of purchase.
This is intentional: an order must not change retroactively if the product is edited
or deleted later.

## Stock safety
Stock is decremented with an atomic conditional update
(`updateOne({ stock: { $gte: qty } }, { $inc: { stock: -qty } })`), so two people buying
the last item at the same time can't oversell it. If any item in an order fails to
reserve, everything already reserved for that order is rolled back.

## Image storage
`services/imageStorage.service.js` exposes two functions: `saveImage` and `deleteImage`.
Only this file touches the filesystem. Swapping local disk for S3 later means rewriting
this one file; nothing else in the app needs to change.

## Payments
`services/payment.service.js` exposes one function, `charge({ method, amount, details })`,
returning `{ status, reference }`. All three methods (COD, mock card, mock UPI) are
simulated. A real gateway integration replaces the body of this function only.

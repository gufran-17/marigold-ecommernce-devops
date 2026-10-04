import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, ConfirmDialog, ErrorState, PageLoader, StatusBadge } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { orderApi } from '../../api';
import { firstImage } from '../../utils/image';
import { formatDate, formatPrice, PAYMENT_LABELS, errorMessage } from '../../utils/format';
import { toast } from '../../utils/toast';

const CANCELLABLE = ['Pending', 'Confirmed'];

export default function OrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error, setData } = useAsync(() => orderApi.get(id).then((d) => d.order), [id]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (error || !order) return <ErrorState message="We couldn't find this order." />;

  const cancel = async () => {
    setBusy(true);
    try {
      const { order: updated } = await orderApi.cancel(order._id);
      setData(updated);
      toast.success('Order cancelled');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false); setConfirmOpen(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <Link to="/orders" className="text-sm font-semibold text-brand hover:underline">← Back to my orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold sm:text-3xl">Order #{order.orderNumber}</h1><p className="mt-1 text-sm text-ink-muted">Placed on {formatDate(order.createdAt, true)}</p></div>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold">Items</h2>
            <ul className="mt-3 divide-y divide-line">
              {order.items.map((it) => (
                <li key={it.product} className="flex items-center gap-3 py-3">
                  <img src={firstImage({ images: [{ url: it.image }] })} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1 text-sm"><Link to={`/products/${it.slug}`} className="font-semibold hover:text-brand">{it.name}</Link><p className="text-ink-muted">Qty {it.quantity} × {formatPrice(it.price)}</p></div>
                  <p className="text-sm font-bold">{formatPrice(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Shipping address</h2>
            <p className="mt-2 text-sm text-ink-soft">{order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
          </div>
          <div className="card p-5">
            <h2 className="font-bold">Order timeline</h2>
            <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="relative text-sm"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand" />
                  <span className="font-semibold">{h.status}</span> · <span className="text-ink-muted">{formatDate(h.at, true)}</span></li>
              ))}
            </ol>
          </div>
        </div>

        <div className="card h-fit space-y-4 p-5">
          <div><h2 className="font-bold">Payment</h2><p className="mt-1 text-sm text-ink-soft">{PAYMENT_LABELS[order.paymentMethod]}</p><StatusBadge status={order.paymentStatus} /></div>
          <dl className="space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Items total</dt><dd>{formatPrice(order.itemsTotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-brand"><dt>Discount</dt><dd>-{formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>Total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
          </dl>
          {CANCELLABLE.includes(order.orderStatus) && <Button variant="danger" className="w-full" onClick={() => setConfirmOpen(true)}>Cancel order</Button>}
        </div>
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel this order?" message="This cannot be undone. Any payment will be marked as refunded." confirmLabel="Yes, cancel order" danger loading={busy} onConfirm={cancel} />
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, BookmarkPlus } from 'lucide-react';
import { Button, EmptyState, PageLoader } from '../../components/ui';
import { removeCartItem, saveForLater, updateCartItem } from '../../features/cartSlice';
import { firstImage } from '../../utils/image';
import { formatPrice, errorMessage } from '../../utils/format';
import { toast } from '../../utils/toast';

function CartRow({ item }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const { product, quantity } = item;
  const max = Math.min(product.stock, 20);

  const change = async (q) => {
    if (q < 1 || q > max) return;
    setBusy(true);
    try { await dispatch(updateCartItem({ productId: product._id, quantity: q })).unwrap(); }
    catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await dispatch(removeCartItem(product._id)).unwrap(); toast.success('Item removed'); }
    finally { setBusy(false); }
  };
  const later = async () => {
    setBusy(true);
    try { await dispatch(saveForLater(product._id)).unwrap(); toast.success('Saved for later'); }
    finally { setBusy(false); }
  };

  return (
    <li className="flex gap-4 py-5">
      <Link to={`/products/${product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-alt"><img src={firstImage(product)} alt="" className="h-full w-full object-cover" /></Link>
      <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <Link to={`/products/${product.slug}`} className="line-clamp-2 text-sm font-bold hover:text-brand">{product.name}</Link>
          <p className="mt-0.5 text-xs text-ink-muted">{product.brand}</p>
          <p className="mt-2 text-sm font-extrabold">{formatPrice(product.finalPrice)}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-line">
              <button aria-label="Decrease quantity" disabled={busy} onClick={() => change(quantity - 1)} className="p-2 hover:bg-surface-alt disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-8 text-center text-sm font-bold">{quantity}</span>
              <button aria-label="Increase quantity" disabled={busy || quantity >= max} onClick={() => change(quantity + 1)} className="p-2 hover:bg-surface-alt disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button onClick={later} disabled={busy} className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-brand"><BookmarkPlus className="h-3.5 w-3.5" />Save for later</button>
            <button onClick={remove} disabled={busy} className="flex items-center gap-1 text-xs font-semibold text-sale hover:underline"><Trash2 className="h-3.5 w-3.5" />Remove</button>
          </div>
        </div>
        <p className="text-right text-sm font-extrabold sm:w-24">{formatPrice(product.finalPrice * quantity)}</p>
      </div>
    </li>
  );
}

export default function Cart() {
  const { items, summary, loading, loaded } = useSelector((s) => s.cart);
  const navigate = useNavigate();

  if (loading && !loaded) return <PageLoader />;
  if (items.length === 0) {
    return (
      <div className="container-page py-14">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" message="Browse our catalog and add something you like." action={<Link to="/products"><Button>Start shopping</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Shopping cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="card divide-y divide-line px-4">
          <ul className="divide-y divide-line">{items.map((i) => <CartRow key={i.product._id} item={i} />)}</ul>
        </div>
        <div className="card h-fit p-5">
          <h2 className="font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatPrice(summary.listTotal)}</dd></div>
            {summary.discount > 0 && <div className="flex justify-between text-brand"><dt>Discount</dt><dd>-{formatPrice(summary.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd>{summary.shippingFee === 0 ? 'Free' : formatPrice(summary.shippingFee)}</dd></div>
            {summary.shippingFee > 0 && <p className="text-xs text-ink-muted">Add {formatPrice(summary.freeShippingThreshold - summary.itemsTotal)} more for free shipping</p>}
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>Total</dt><dd>{formatPrice(summary.totalAmount)}</dd></div>
          </dl>
          <Button className="mt-5 w-full" size="lg" onClick={() => navigate('/checkout')}>Proceed to checkout</Button>
          <Link to="/products" className="mt-3 block text-center text-sm font-semibold text-brand hover:underline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

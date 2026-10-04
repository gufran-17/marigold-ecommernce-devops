import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Heart, Minus, Plus, ShieldCheck, ShoppingCart, Truck, RotateCcw } from 'lucide-react';
import { Button, ErrorState, PageLoader, RatingInput, Rating, Skeleton } from '../../components/ui';
import { ProductGrid } from '../../components/product/ProductCard';
import { PriceBlock } from '../../components/product/ProductCard';
import useAsync from '../../hooks/useAsync';
import useShopActions from '../../hooks/useShopActions';
import { productApi, reviewApi } from '../../api';
import { imageUrl } from '../../utils/image';
import { errorMessage, formatDate } from '../../utils/format';
import { toast } from '../../utils/toast';

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  const img = images[active] || images[0];
  return (
    <div>
      <div className="card aspect-square overflow-hidden">
        <img src={imageUrl(img && img.url)} alt={(img && img.alt) || name} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Product images">
          {images.map((im, i) => (
            <button key={im.url} role="tab" aria-selected={i === active} onClick={() => setActive(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-brand' : 'border-transparent'}`}>
              <img src={imageUrl(im.url)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewForm({ productId, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setErr('Please select a rating');
    setBusy(true); setErr('');
    try {
      await reviewApi.create({ productId, rating, title, comment });
      toast.success('Thanks for your review');
      setRating(0); setComment(''); setTitle('');
      onDone();
    } catch (error) {
      setErr(errorMessage(error, 'Could not submit your review'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <h3 className="font-bold">Write a review</h3>
      <RatingInput value={rating} onChange={setRating} />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="input" maxLength={100} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share details about your experience (optional)" className="input" rows={3} maxLength={1500} />
      {err && <p role="alert" className="text-sm font-medium text-sale">{err}</p>}
      <Button type="submit" loading={busy}>Submit review</Button>
    </form>
  );
}

function Reviews({ product, canReview }) {
  const { data, loading, reload } = useAsync(() => reviewApi.forProduct(product._id, { limit: 10 }), [product._id]);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div>
        <h2 className="text-lg font-bold">Customer reviews</h2>
        {loading ? <div className="mt-3 space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20" />)}</div> : data.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No reviews yet. Be the first to review this product.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {data.reviews.map((r) => (
              <li key={r._id} className="border-b border-line pb-4 last:border-0">
                <div className="flex items-center gap-2"><Rating value={r.rating} count={1} /><span className="text-xs text-ink-muted">{formatDate(r.createdAt)}</span></div>
                {r.title && <p className="mt-1 text-sm font-bold">{r.title}</p>}
                <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>
                <p className="mt-1 text-xs text-ink-muted">by {r.user ? r.user.name : 'A customer'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>{canReview ? <ReviewForm productId={product._id} onDone={reload} /> : <p className="text-sm text-ink-muted">Order this product to leave a review.</p>}</div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { data: product, loading, error } = useAsync(() => productApi.bySlug(slug).then((d) => d.product), [slug]);
  const related = useAsync(() => (product ? productApi.related(slug).then((d) => d.products) : Promise.resolve([])), [slug, !!product]);
  const { add, toggleWish, isWished } = useShopActions();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (error || !product) return <ErrorState message="This product may have been removed." />;

  const wished = isWished(product._id);
  const out = product.stock === 0;
  const max = Math.min(product.stock, 10);

  const doAdd = async () => { setBusy(true); await add(product, qty); setBusy(false); };
  const buyNow = async () => {
    setBusy(true);
    const ok = await add(product, qty);
    setBusy(false);
    if (ok) navigate('/checkout');
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-ink-muted">
        <Link to="/" className="hover:text-brand">Home</Link><ChevronRight className="h-3 w-3" />
        {product.category && <><Link to={`/products?category=${product.category.slug}`} className="hover:text-brand">{product.category.name}</Link><ChevronRight className="h-3 w-3" /></>}
        <span className="truncate text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Gallery images={product.images} name={product.name} />
        <div>
          <p className="text-sm font-semibold text-brand">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{product.name}</h1>
          <div className="mt-2"><Rating value={product.ratingAverage} count={product.ratingCount} /></div>
          <div className="mt-4"><PriceBlock product={product} large /></div>
          <p className={`mt-2 text-sm font-semibold ${out ? 'text-sale' : product.stock <= product.lowStockThreshold ? 'text-marigold-dark' : 'text-brand'}`}>
            {out ? 'Out of stock' : product.stock <= product.lowStockThreshold ? `Only ${product.stock} left in stock` : 'In stock'}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          {!out && (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex items-center rounded-lg border border-line">
                <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-surface-alt disabled:opacity-40" disabled={qty <= 1}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-bold" aria-live="polite">{qty}</span>
                <button aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))} className="p-2.5 hover:bg-surface-alt disabled:opacity-40" disabled={qty >= max}><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button size="lg" className="flex-1 sm:flex-none" disabled={out} loading={busy} onClick={doAdd}><ShoppingCart className="h-5 w-5" />Add to cart</Button>
            <Button size="lg" variant="accent" className="flex-1 sm:flex-none" disabled={out} loading={busy} onClick={buyNow}>Buy now</Button>
            <Button size="lg" variant="outline" aria-pressed={wished} onClick={() => toggleWish(product)}><Heart className={`h-5 w-5 ${wished ? 'fill-sale text-sale' : ''}`} aria-hidden="true" />{wished ? 'Wishlisted' : 'Wishlist'}</Button>
          </div>

          <ul className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
            <li className="flex items-center gap-2 text-xs text-ink-muted"><Truck className="h-4 w-4 text-brand" />Free delivery above ₹999</li>
            <li className="flex items-center gap-2 text-xs text-ink-muted"><RotateCcw className="h-4 w-4 text-brand" />7 day easy returns</li>
            <li className="flex items-center gap-2 text-xs text-ink-muted"><ShieldCheck className="h-4 w-4 text-brand" />Secure checkout</li>
          </ul>

          {product.features.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h2 className="mb-2 font-bold">Highlights</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">{product.features.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          )}
          {product.specifications.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h2 className="mb-2 font-bold">Specifications</h2>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {product.specifications.map((s) => (<div key={s.key} className="flex justify-between gap-4 border-b border-line/70 py-1.5 sm:justify-start"><dt className="text-ink-muted">{s.key}</dt><dd className="font-semibold">{s.value}</dd></div>))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-8"><Reviews product={product} canReview={!!user} /></div>

      {related.data && related.data.length > 0 && (
        <div className="mt-12 border-t border-line pt-8">
          <h2 className="mb-5 text-xl font-extrabold">You may also like</h2>
          <ProductGrid products={related.data} className="md:grid-cols-4" />
        </div>
      )}
    </div>
  );
}

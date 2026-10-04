import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import Rating from '../ui/Rating';
import Button from '../ui/Button';
import useShopActions from '../../hooks/useShopActions';
import { firstImage } from '../../utils/image';
import { formatPrice } from '../../utils/format';

export function PriceBlock({ product, large = false }) {
  const onSale = product.discountPercent > 0;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`${large ? 'text-3xl' : 'text-base'} font-extrabold text-ink`}>{formatPrice(product.finalPrice)}</span>
      {onSale && <span className={`${large ? 'text-base' : 'text-xs'} text-ink-muted line-through`}>{formatPrice(product.price)}</span>}
      {onSale && <span className={`${large ? 'text-base' : 'text-xs'} font-bold text-sale`}>{product.discountPercent}% off</span>}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { add, toggleWish, isWished } = useShopActions();
  const [busy, setBusy] = useState(false);
  const wished = isWished(product._id);
  const out = product.stock === 0;
  const low = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const href = `/products/${product.slug}`;

  const onAdd = async () => { setBusy(true); await add(product); setBusy(false); };

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-pop">
      <div className="relative aspect-square overflow-hidden bg-surface-alt">
        <Link to={href} tabIndex={-1} aria-hidden="true">
          <img src={firstImage(product)} alt="" loading="lazy" className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${out ? 'opacity-50' : ''}`} />
        </Link>
        {product.discountPercent > 0 && !out && <span className="absolute left-2 top-2 rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-white">{product.discountPercent}% off</span>}
        {out && <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-white">Out of stock</span>}
        {low && <span className="absolute bottom-2 left-2 rounded-md bg-marigold px-2 py-0.5 text-xs font-bold text-ink">Only {product.stock} left</span>}
        <button onClick={() => toggleWish(product)} aria-pressed={wished} aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-card hover:bg-white">
          <Heart className={`h-5 w-5 ${wished ? 'fill-sale text-sale' : 'text-ink-soft'}`} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold text-ink-muted">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug"><Link to={href} className="hover:text-brand">{product.name}</Link></h3>
        <Rating value={product.ratingAverage} count={product.ratingCount} />
        <div className="mt-auto pt-2"><PriceBlock product={product} /></div>
        <Button size="sm" variant={out ? 'outline' : 'primary'} className="mt-3 w-full" disabled={out} loading={busy} onClick={onAdd}>
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />{out ? 'Unavailable' : 'Add to cart'}
        </Button>
      </div>
    </article>
  );
}

export function ProductGrid({ products, className = '' }) {
  return <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 ${className}`}>{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>;
}

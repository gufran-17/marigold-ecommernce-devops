import { Link } from 'react-router-dom';
import { ProductGrid } from './ProductCard';
import { ProductCardSkeleton, ErrorState } from '../ui';
import useAsync from '../../hooks/useAsync';
import { productApi } from '../../api';

// A titled section that loads and shows a few products (used on the home page)
export default function ProductRow({ title, subtitle, params, viewAllTo }) {
  const { data, loading, error, reload } = useAsync(() => productApi.list({ limit: 4, ...params }), [JSON.stringify(params)]);
  return (
    <section className="container-page py-8 sm:py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>{subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}</div>
        {viewAllTo && <Link to={viewAllTo} className="link shrink-0 text-sm">View all</Link>}
      </div>
      {error ? <ErrorState onRetry={reload} /> : loading
        ? <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)}</div>
        : <ProductGrid products={data.products} className="md:grid-cols-4" />}
    </section>
  );
}

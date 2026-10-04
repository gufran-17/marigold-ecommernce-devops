import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, SearchX } from 'lucide-react';
import { ProductGrid } from '../../components/product/ProductCard';
import { Button, EmptyState, ErrorState, Modal, Pagination, ProductCardSkeleton, Select } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useCategories from '../../hooks/useCategories';
import { productApi } from '../../api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Best selling' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
];

function Filters({ params, setParam, setParams, brands, categories }) {
  const [min, setMin] = useState(params.get('minPrice') || '');
  const [max, setMax] = useState(params.get('maxPrice') || '');
  useEffect(() => { setMin(params.get('minPrice') || ''); setMax(params.get('maxPrice') || ''); }, [params]);
  const group = 'border-b border-line py-4 last:border-0';
  const title = 'mb-2.5 text-sm font-bold';
  const applyPrice = (e) => {
    e.preventDefault();
    setParams({ minPrice: min, maxPrice: max });
  };
  return (
    <div>
      <div className={group}>
        <h3 className={title}>Category</h3>
        <ul className="space-y-1.5 text-sm">
          <li><label className="flex cursor-pointer items-center gap-2"><input type="radio" name="cat" checked={!params.get('category')} onChange={() => setParam('category', '')} className="accent-brand" />All categories</label></li>
          {categories.map((c) => (
            <li key={c._id}><label className="flex cursor-pointer items-center gap-2"><input type="radio" name="cat" checked={params.get('category') === c.slug} onChange={() => setParam('category', c.slug)} className="accent-brand" />{c.name}<span className="text-xs text-ink-muted">({c.productCount})</span></label></li>
          ))}
        </ul>
      </div>
      <div className={group}>
        <h3 className={title}>Brand</h3>
        <Select aria-label="Brand" value={params.get('brand') || ''} onChange={(e) => setParam('brand', e.target.value)} placeholder="All brands" options={brands} />
      </div>
      <form className={group} onSubmit={applyPrice}>
        <h3 className={title}>Price (₹)</h3>
        <div className="flex items-center gap-2">
          <input aria-label="Minimum price" inputMode="numeric" className="input" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} />
          <span className="text-ink-muted">-</span>
          <input aria-label="Maximum price" inputMode="numeric" className="input" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} />
        </div>
        <Button type="submit" variant="outline" size="sm" className="mt-2.5 w-full">Apply price</Button>
      </form>
      <div className={group}>
        <h3 className={title}>Customer rating</h3>
        <ul className="space-y-1.5 text-sm">
          {['', '4', '3'].map((r) => (
            <li key={r || 'any'}><label className="flex cursor-pointer items-center gap-2"><input type="radio" name="rating" checked={(params.get('rating') || '') === r} onChange={() => setParam('rating', r)} className="accent-brand" />{r ? `${r} stars & up` : 'Any rating'}</label></li>
          ))}
        </ul>
      </div>
      <div className={group}>
        <h3 className={title}>Availability</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={params.get('inStock') === 'true'} onChange={(e) => setParam('inStock', e.target.checked ? 'true' : '')} className="accent-brand" />In stock only</label>
        <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={params.get('onSale') === 'true'} onChange={(e) => setParam('onSale', e.target.checked ? 'true' : '')} className="accent-brand" />On sale</label>
      </div>
    </div>
  );
}

export default function Products({ search = false }) {
  const [params, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categories = useCategories();
  const brandsQ = useAsync(() => productApi.brands(), []);

  const query = params.get('q') || '';
  const page = Number(params.get('page')) || 1;
  const apiParams = {
    page, limit: 12, sort: params.get('sort') || 'newest',
    ...(query && { search: query }),
    ...['category', 'brand', 'minPrice', 'maxPrice', 'rating', 'inStock', 'onSale'].reduce((o, k) => (params.get(k) ? { ...o, [k]: params.get(k) } : o), {}),
  };
  const { data, loading, error, reload } = useAsync(() => productApi.list(apiParams), [params.toString()]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  };
  const setParam = (k, v) => update({ [k]: v });

  const activeCategory = categories.find((c) => c.slug === params.get('category'));
  const chips = [
    activeCategory && { k: 'category', label: activeCategory.name },
    params.get('brand') && { k: 'brand', label: params.get('brand') },
    (params.get('minPrice') || params.get('maxPrice')) && { k: 'price', label: `₹${params.get('minPrice') || 0} - ${params.get('maxPrice') ? `₹${params.get('maxPrice')}` : 'any'}` },
    params.get('rating') && { k: 'rating', label: `${params.get('rating')}★ & up` },
    params.get('inStock') && { k: 'inStock', label: 'In stock' },
    params.get('onSale') && { k: 'onSale', label: 'On sale' },
  ].filter(Boolean);
  const clearChip = (k) => (k === 'price' ? update({ minPrice: '', maxPrice: '' }) : update({ [k]: '' }));
  const filterProps = { params, setParam, setParams: update, brands: (brandsQ.data && brandsQ.data.brands) || [], categories };

  const heading = search || query ? `Results for “${query}”` : activeCategory ? activeCategory.name : 'All products';

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{heading}</h1>
          {data && <p className="mt-1 text-sm text-ink-muted" aria-live="polite">{data.pagination.total} {data.pagination.total === 1 ? 'product' : 'products'}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal className="h-4 w-4" />Filters</Button>
          <Select aria-label="Sort by" value={params.get('sort') || 'newest'} onChange={(e) => setParam('sort', e.target.value)} options={SORT_OPTIONS} className="min-w-44" />
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mb-4 flex flex-wrap gap-2" aria-label="Active filters">
          {chips.map((c) => (
            <li key={c.k}><button onClick={() => clearChip(c.k)} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold hover:border-sale hover:text-sale">{c.label}<X className="h-3 w-3" aria-label="Remove filter" /></button></li>
          ))}
          <li><button onClick={() => setSearchParams(query ? { q: query } : {})} className="px-2 py-1 text-xs font-semibold text-brand hover:underline">Clear all</button></li>
        </ul>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="card hidden self-start px-4 lg:block" aria-label="Filters"><Filters {...filterProps} /></aside>
        <div>
          {error ? <ErrorState onRetry={reload} /> : loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : data.products.length === 0 ? (
            <div className="card"><EmptyState icon={SearchX} title="No products found" message="Try removing a filter or searching for something else." action={<Button variant="outline" onClick={() => setSearchParams({})}>Clear filters</Button>} /></div>
          ) : (
            <>
              <ProductGrid products={data.products} className="xl:grid-cols-3" />
              <Pagination pagination={data.pagination} onChange={(p) => { update({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0 }); }} />
            </>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" footer={<Button onClick={() => setFiltersOpen(false)}>Show results</Button>}>
        <Filters {...filterProps} />
      </Modal>
    </div>
  );
}

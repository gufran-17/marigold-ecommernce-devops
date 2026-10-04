import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui';
import useCategories from '../../hooks/useCategories';
import { imageUrl } from '../../utils/image';

export default function Categories() {
  const categories = useCategories();
  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Shop by category</h1>
      <p className="mt-1 text-sm text-ink-muted">Find what you need faster.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 && [0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}
        {categories.map((c) => (
          <Link key={c._id} to={`/products?category=${c.slug}`} className="card group flex overflow-hidden transition-shadow hover:shadow-pop">
            <img src={imageUrl(c.image)} alt="" loading="lazy" className="h-full w-32 shrink-0 object-cover sm:w-40" />
            <div className="flex flex-col justify-center p-4">
              <h2 className="text-lg font-bold group-hover:text-brand">{c.name}</h2>
              <p className="mt-1 text-sm text-ink-muted">{c.description}</p>
              <p className="mt-2 text-xs font-semibold text-brand">{c.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

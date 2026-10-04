import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { Button, EmptyState, PageLoader } from '../../components/ui';
import { ProductGrid } from '../../components/product/ProductCard';

export default function Wishlist() {
  const { products, loaded } = useSelector((s) => s.wishlist);
  if (!loaded) return <PageLoader />;
  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">My wishlist</h1>
      {products.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Heart} title="Your wishlist is empty" message="Save products you love to find them here later." action={<Link to="/products"><Button>Discover products</Button></Link>} /></div>
      ) : (
        <div className="mt-6"><ProductGrid products={products} /></div>
      )}
    </div>
  );
}

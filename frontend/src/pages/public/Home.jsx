import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import ProductRow from '../../components/product/ProductRow';
import { Button, Skeleton } from '../../components/ui';
import useCategories from '../../hooks/useCategories';
import { imageUrl } from '../../utils/image';
import { toast } from '../../utils/toast';

const benefits = [
  { icon: Truck, title: 'Fast delivery', text: 'Free on orders above ₹999' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'Card, UPI or pay on delivery' },
  { icon: RotateCcw, title: 'Easy returns', text: '7 days, no questions asked' },
  { icon: Headphones, title: 'Customer support', text: 'Real people, 7 days a week' },
];

function Hero({ categories }) {
  const tiles = categories.slice(0, 4);
  return (
    <section className="bg-brand-dark text-white">
      <div className="container-page grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <div>
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold">New season prices are live</p>
          <h1 className="text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.4rem]">Everything for your home, your desk and your weekend.</h1>
          <p className="mt-4 max-w-lg text-base text-white/80 sm:text-lg">Electronics, fashion, kitchen, beauty, fitness and books from brands you can trust. Pay online or on delivery.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/products"><Button variant="accent" size="lg">Shop all products</Button></Link>
            <Link to="/products?onSale=true"><Button size="lg" className="border border-white/40 bg-transparent hover:bg-white/10">See today&apos;s deals</Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {tiles.length === 0 && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[4/3] bg-white/10" />)}
          {tiles.map((c, i) => (
            <Link key={c._id} to={`/products?category=${c.slug}`} className={`group relative block overflow-hidden rounded-xl ${i % 2 ? 'mt-4 sm:mt-6' : ''}`}>
              <img src={imageUrl(c.image)} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 pt-8 text-sm font-bold text-white">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryGrid({ categories }) {
  return (
    <section className="container-page py-8 sm:py-10">
      <h2 className="mb-5 text-xl font-extrabold sm:text-2xl">Shop by category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {categories.map((c) => (
          <Link key={c._id} to={`/products?category=${c.slug}`} className="card group overflow-hidden text-center transition-shadow hover:shadow-pop">
            <img src={imageUrl(c.image)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            <div className="p-3"><p className="text-sm font-bold group-hover:text-brand">{c.name}</p><p className="text-xs text-ink-muted">{c.productCount} products</p></div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email address');
    toast.success('You are subscribed. Watch your inbox for offers.');
    return setEmail('');
  };
  return (
    <section className="container-page py-8 sm:py-10">
      <div className="card flex flex-col items-start justify-between gap-6 p-6 sm:p-10 md:flex-row md:items-center">
        <div><h2 className="text-xl font-extrabold sm:text-2xl">Get offers before everyone else</h2><p className="mt-1 text-sm text-ink-muted">One email a week. Unsubscribe any time.</p></div>
        <form onSubmit={submit} noValidate className="flex w-full gap-2 md:max-w-md">
          <label htmlFor="newsletter" className="sr-only">Email address</label>
          <input id="newsletter" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="input" />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}

export default function Home() {
  const categories = useCategories();
  return (
    <>
      <Hero categories={categories} />
      <section className="border-b border-line bg-white" aria-label="Why shop with us">
        <ul className="container-page grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="text-sm font-bold">{title}</p><p className="text-xs text-ink-muted">{text}</p></div>
            </li>
          ))}
        </ul>
      </section>
      <CategoryGrid categories={categories} />
      <ProductRow title="Trending now" subtitle="Hand-picked by our team" params={{ featured: true }} viewAllTo="/products" />
      <section className="container-page py-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-marigold p-6 sm:flex-row sm:items-center sm:p-10">
          <div><h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Free delivery above ₹999</h2><p className="mt-1 text-ink/80">Cash on delivery available on every order.</p></div>
          <Link to="/products"><Button size="lg" className="bg-ink hover:bg-ink-soft">Start shopping</Button></Link>
        </div>
      </section>
      <ProductRow title="Best sellers" subtitle="What most customers are buying" params={{ sort: 'popular' }} viewAllTo="/products?sort=popular" />
      <ProductRow title="Deals of the day" subtitle="Biggest discounts right now" params={{ onSale: true, sort: 'discount' }} viewAllTo="/products?onSale=true&sort=discount" />
      <ProductRow title="New arrivals" subtitle="Just added to the store" params={{ sort: 'newest' }} viewAllTo="/products?sort=newest" />
      <Newsletter />
    </>
  );
}

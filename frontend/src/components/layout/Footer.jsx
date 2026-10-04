import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Navbar';
import { toast } from '../../utils/toast';

const col = 'space-y-2.5 text-sm text-white/75';
const lnk = 'hover:text-white';

export default function Footer() {
  const [email, setEmail] = useState('');
  const subscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email address');
    toast.success('Thanks for subscribing');
    setEmail('');
  };
  return (
    <footer className="mt-16 bg-ink text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-white/70">Everyday essentials from brands you trust, delivered to your door. Simple returns and support that answers.</p>
          <form onSubmit={subscribe} className="mt-5 flex max-w-sm gap-2" noValidate>
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input id="footer-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="input border-white/20 bg-white/10 text-white placeholder:text-white/50" />
            <button className="rounded-lg bg-marigold px-4 text-sm font-bold text-ink hover:bg-marigold-dark">Join</button>
          </form>
        </div>
        <nav aria-label="Shop"><h3 className="mb-3 text-sm font-bold text-white">Shop</h3>
          <ul className={col}><li><Link className={lnk} to="/products">All products</Link></li><li><Link className={lnk} to="/categories">Categories</Link></li><li><Link className={lnk} to="/products?onSale=true">Deals</Link></li><li><Link className={lnk} to="/wishlist">Wishlist</Link></li></ul></nav>
        <nav aria-label="Account"><h3 className="mb-3 text-sm font-bold text-white">Account</h3>
          <ul className={col}><li><Link className={lnk} to="/profile">My profile</Link></li><li><Link className={lnk} to="/orders">My orders</Link></li><li><Link className={lnk} to="/cart">Cart</Link></li></ul></nav>
        <nav aria-label="Company"><h3 className="mb-3 text-sm font-bold text-white">Company</h3>
          <ul className={col}><li><Link className={lnk} to="/about">About us</Link></li><li><Link className={lnk} to="/contact">Contact</Link></li><li><Link className={lnk} to="/admin/login">Admin</Link></li></ul></nav>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} Marigold. Demo store: payments are simulated.</div>
    </footer>
  );
}

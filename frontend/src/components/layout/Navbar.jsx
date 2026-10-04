import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, LogOut, Menu, Package, Search, ShoppingCart, User, X, ChevronDown, ShoppingBag } from 'lucide-react';
import { logout } from '../../features/authSlice';
import { resetCart, selectCartCount } from '../../features/cartSlice';
import { resetWishlist } from '../../features/wishlistSlice';
import useCategories from '../../hooks/useCategories';

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Marigold home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white"><ShoppingBag className="h-5 w-5" aria-hidden="true" /></span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Marigold</span>
    </Link>
  );
}

function SearchBar({ className = '', onDone }) {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onDone && onDone();
  };
  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">Search products</label>
      <input id="site-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands and more" className="input rounded-full bg-surface pl-11 pr-24" />
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">Search</button>
    </form>
  );
}

function AccountMenu() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);

  if (!user) {
    return (
      <Link to="/login" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-alt">
        <User className="h-5 w-5" aria-hidden="true" /><span className="hidden sm:inline">Log in</span>
      </Link>
    );
  }
  const doLogout = () => {
    dispatch(logout()); dispatch(resetCart()); dispatch(resetWishlist());
    setOpen(false); navigate('/');
  };
  const item = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface';
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-alt">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
        <span className="hidden max-w-[7rem] truncate sm:inline">{user.name.split(' ')[0]}</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-pop">
          <div className="border-b border-line px-4 py-2.5"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-ink-muted">{user.email}</p></div>
          {user.role === 'admin' && <Link role="menuitem" to="/admin" onClick={() => setOpen(false)} className={item}>Admin dashboard</Link>}
          <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className={item}><User className="h-4 w-4" />My profile</Link>
          <Link role="menuitem" to="/orders" onClick={() => setOpen(false)} className={item}><Package className="h-4 w-4" />My orders</Link>
          <button role="menuitem" onClick={doLogout} className={`${item} border-t border-line text-sale`}><LogOut className="h-4 w-4" />Log out</button>
        </div>
      )}
    </div>
  );
}

const iconBtn = 'relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-surface-alt';

export default function Navbar() {
  const count = useSelector(selectCartCount);
  const wishCount = useSelector((s) => s.wishlist.products.length);
  const categories = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="bg-brand-dark px-4 py-1.5 text-center text-xs font-medium text-white">Free delivery on orders above ₹999</div>
      <div className="container-page flex h-16 items-center gap-3">
        <button className={`${iconBtn} lg:hidden`} onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        <Logo />
        <SearchBar className="mx-4 hidden max-w-2xl flex-1 lg:block" />
        <div className="ml-auto flex items-center gap-1">
          <AccountMenu />
          <Link to="/wishlist" className={iconBtn} aria-label={`Wishlist, ${wishCount} items`}>
            <Heart className="h-5 w-5" />
            {wishCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">{wishCount}</span>}
          </Link>
          <Link to="/cart" className={iconBtn} aria-label={`Cart, ${count} items`}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-marigold px-1 text-[10px] font-bold text-ink">{count}</span>}
          </Link>
        </div>
      </div>
      <div className="container-page pb-3 lg:hidden"><SearchBar /></div>

      <nav aria-label="Categories" className="hidden border-t border-line lg:block">
        <ul className="container-page flex items-center gap-1 overflow-x-auto">
          <li><NavLink to="/products" end className={({ isActive }) => `block whitespace-nowrap px-3 py-3 text-sm font-semibold ${isActive ? 'text-brand' : 'text-ink-soft hover:text-brand'}`}>All products</NavLink></li>
          {categories.map((c) => (
            <li key={c._id}><NavLink to={`/products?category=${c.slug}`} className="block whitespace-nowrap px-3 py-3 text-sm font-medium text-ink-soft hover:text-brand">{c.name}</NavLink></li>
          ))}
          <li className="ml-auto"><Link to="/products?onSale=true" className="block whitespace-nowrap px-3 py-3 text-sm font-bold text-sale">Deals</Link></li>
        </ul>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-line p-4"><Logo /><button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 hover:bg-surface-alt"><X className="h-5 w-5" /></button></div>
            <nav className="flex-1 overflow-y-auto py-2" aria-label="Mobile">
              {[{ to: '/products', label: 'All products' }, ...categories.map((c) => ({ to: `/products?category=${c.slug}`, label: c.name })), { to: '/products?onSale=true', label: 'Deals' }, { to: '/categories', label: 'All categories' }, { to: '/orders', label: 'My orders' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }].map((l) => (
                <Link key={l.label} to={l.to} onClick={() => setMobileOpen(false)} className="block px-5 py-3 text-sm font-semibold text-ink-soft hover:bg-surface">{l.label}</Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

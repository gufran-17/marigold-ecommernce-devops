import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Boxes, ClipboardList, ExternalLink, LogOut, Menu, MessageSquare, Package, Tags, Users, X } from 'lucide-react';
import { logout } from '../../features/authSlice';
import { Logo } from './Navbar';

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-brand text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />{label}
        </NavLink>
      ))}
    </nav>
  );
  const bottom = (
    <div className="space-y-1 border-t border-white/10 p-3">
      <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10"><ExternalLink className="h-5 w-5" />View store</Link>
      <button onClick={() => { dispatch(logout()); navigate('/admin/login'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10"><LogOut className="h-5 w-5" />Log out</button>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-ink lg:flex">
        <div className="border-b border-white/10 p-4"><Logo light /></div>{nav}{bottom}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink">
            <div className="flex items-center justify-between border-b border-white/10 p-4"><Logo light /><button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white"><X className="h-5 w-5" /></button></div>{nav}{bottom}
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <button className="rounded-lg p-2 hover:bg-surface-alt lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <p className="hidden text-sm font-semibold text-ink-muted lg:block">Admin panel</p>
          <p className="text-sm font-semibold text-ink-soft">{user && user.name}</p>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}

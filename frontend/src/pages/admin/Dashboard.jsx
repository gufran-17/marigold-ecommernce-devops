import { Link } from 'react-router-dom';
import { AlertTriangle, DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { ErrorState, StatusBadge, TableSkeleton } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi } from '../../api';
import { firstImage } from '../../utils/image';
import { formatDate, formatPrice } from '../../utils/format';

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tint}`}><Icon className="h-5 w-5" /></span>
      <div><p className="text-xs font-semibold text-ink-muted">{label}</p><p className="text-xl font-extrabold">{value}</p></div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(() => adminApi.stats(), []);
  if (loading) return <TableSkeleton rows={8} />;
  if (error) return <ErrorState onRetry={reload} />;
  const { totals, revenue, lowStock, recentOrders, recentCustomers } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Total products" value={totals.totalProducts} tint="bg-brand-light text-brand" />
        <StatCard icon={Users} label="Customers" value={totals.totalCustomers} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={ShoppingCart} label="Total orders" value={totals.totalOrders} tint="bg-marigold-light text-marigold-dark" />
        <StatCard icon={DollarSign} label="Revenue collected" value={formatPrice(revenue.collected)} tint="bg-sale-light text-sale" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4"><p className="text-xs font-semibold text-ink-muted">Pending orders</p><p className="mt-1 text-2xl font-extrabold">{totals.pendingOrders}</p></div>
        <div className="card p-4"><p className="text-xs font-semibold text-ink-muted">Delivered orders</p><p className="mt-1 text-2xl font-extrabold">{totals.deliveredOrders}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Recent orders</h2>
          <ul className="mt-3 divide-y divide-line">
            {recentOrders.map((o) => (
              <li key={o._id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div><Link to={`/admin/orders`} className="font-semibold hover:text-brand">{o.orderNumber}</Link><p className="text-xs text-ink-muted">{o.user ? o.user.name : 'Customer'} · {formatDate(o.createdAt)}</p></div>
                <StatusBadge status={o.orderStatus} />
              </li>
            ))}
            {recentOrders.length === 0 && <p className="py-3 text-sm text-ink-muted">No orders yet.</p>}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4 text-marigold-dark" />Low stock products</h2>
          <ul className="mt-3 divide-y divide-line">
            {lowStock.map((p) => (
              <li key={p._id} className="flex items-center gap-3 py-2.5 text-sm">
                <img src={firstImage(p)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="flex-1"><Link to="/admin/products" className="font-semibold hover:text-brand">{p.name}</Link><p className="text-xs text-ink-muted">SKU {p.sku}</p></div>
                <span className="font-bold text-sale">{p.stock} left</span>
              </li>
            ))}
            {lowStock.length === 0 && <p className="py-3 text-sm text-ink-muted">All products are well stocked.</p>}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold">Recent customers</h2>
        <ul className="mt-3 divide-y divide-line">
          {recentCustomers.map((c) => (
            <li key={c._id} className="flex items-center justify-between py-2.5 text-sm"><div><p className="font-semibold">{c.name}</p><p className="text-xs text-ink-muted">{c.email}</p></div><span className="text-xs text-ink-muted">Joined {formatDate(c.createdAt)}</span></li>
          ))}
          {recentCustomers.length === 0 && <p className="py-3 text-sm text-ink-muted">No customers yet.</p>}
        </ul>
      </div>
    </div>
  );
}

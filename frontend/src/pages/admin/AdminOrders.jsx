import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminToolbar from '../../components/admin/AdminToolbar';
import { ErrorState, Pagination, Select, StatusBadge, TableSkeleton } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { adminApi } from '../../api';
import { errorMessage, formatDate, formatPrice } from '../../utils/format';
import { toast } from '../../utils/toast';

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);
  const { data, loading, error, reload, setData } = useAsync(() => adminApi.orders({ page, limit: 10, search: debounced, status: status || undefined }), [page, debounced, status]);
  const [busyId, setBusyId] = useState(null);

  const changeStatus = async (order, newStatus) => {
    setBusyId(order._id);
    try {
      const { order: updated } = await adminApi.updateOrderStatus(order._id, newStatus);
      setData((d) => ({ ...d, orders: d.orders.map((o) => (o._id === updated._id ? updated : o)) }));
      toast.success('Order status updated');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Orders</h1>
      <div className="card">
        <div className="p-4"><AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by order number">
          <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} placeholder="All statuses" options={STATUSES} className="min-w-40" />
        </AdminToolbar></div>
        {loading ? <TableSkeleton /> : error ? <ErrorState onRetry={reload} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted"><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data.orders.map((o) => (
                  <tr key={o._id}>
                    <td className="px-4 py-3"><Link to={`/admin/orders`} className="font-semibold hover:text-brand">{o.orderNumber}</Link></td>
                    <td className="px-4 py-3 text-ink-soft">{o.user ? <>{o.user.name}<br /><span className="text-xs text-ink-muted">{o.user.email}</span></> : '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <select aria-label={`Status for ${o.orderNumber}`} value={o.orderStatus} disabled={busyId === o._id || ['Delivered', 'Cancelled'].includes(o.orderStatus)} onChange={(e) => changeStatus(o, e.target.value)} className="input min-w-36 py-1.5 text-xs">
                        {STATUSES.map((s) => <option key={s} value={s} disabled={STATUSES.indexOf(s) < STATUSES.indexOf(o.orderStatus) && s !== 'Cancelled'}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {data.orders.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div className="px-4 pb-4"><Pagination pagination={data.pagination} onChange={setPage} /></div>}
      </div>
    </div>
  );
}

import { useState } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import { ErrorState, Modal, Pagination, StatusBadge, TableSkeleton } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { adminApi } from '../../api';
import { errorMessage, formatDate, formatPrice } from '../../utils/format';
import { toast } from '../../utils/toast';

function CustomerDetails({ id, onClose }) {
  const { data, loading } = useAsync(() => adminApi.customer(id), [id]);
  return (
    <Modal open onClose={onClose} title="Customer details">
      {loading ? <p className="text-sm text-ink-muted">Loading…</p> : (
        <div className="space-y-4">
          <div><p className="font-bold">{data.customer.name}</p><p className="text-sm text-ink-muted">{data.customer.email}</p>{data.customer.phone && <p className="text-sm text-ink-muted">{data.customer.phone}</p>}</div>
          <div className="flex gap-6 text-sm"><div><p className="text-ink-muted">Orders</p><p className="font-bold">{data.orderCount}</p></div><div><p className="text-ink-muted">Total spent</p><p className="font-bold">{formatPrice(data.totalSpent)}</p></div></div>
          <div><h3 className="mb-2 text-sm font-bold">Recent orders</h3>
            <ul className="space-y-2">{data.orders.map((o) => (<li key={o._id} className="flex items-center justify-between rounded-lg border border-line p-2 text-sm"><span>{o.orderNumber}</span><StatusBadge status={o.orderStatus} /></li>))}
              {data.orders.length === 0 && <p className="text-sm text-ink-muted">No orders yet.</p>}</ul>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);
  const { data, loading, error, reload, setData } = useAsync(() => adminApi.customers({ page, limit: 10, search: debounced }), [page, debounced]);
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);

  const toggle = async (c) => {
    setBusyId(c._id);
    try {
      const { customer } = await adminApi.toggleCustomer(c._id);
      setData((d) => ({ ...d, customers: d.customers.map((x) => (x._id === customer._id ? customer : x)) }));
      toast.success(customer.isActive ? 'Customer enabled' : 'Customer disabled');
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setBusyId(null); }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Customers</h1>
      <div className="card">
        <div className="p-4"><AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email" /></div>
        {loading ? <TableSkeleton /> : error ? <ErrorState onRetry={reload} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data.customers.map((c) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3"><button onClick={() => setSelected(c._id)} className="font-semibold hover:text-brand">{c.name}</button></td>
                    <td className="px-4 py-3 text-ink-soft">{c.email}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.isActive ? 'bg-brand-light text-brand-dark' : 'bg-sale-light text-sale'}`}>{c.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td className="px-4 py-3 text-right"><button onClick={() => toggle(c)} disabled={busyId === c._id} className="text-xs font-semibold text-brand hover:underline disabled:opacity-50">{c.isActive ? 'Disable' : 'Enable'}</button></td>
                  </tr>
                ))}
                {data.customers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-muted">No customers found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div className="px-4 pb-4"><Pagination pagination={data.pagination} onChange={setPage} /></div>}
      </div>
      {selected && <CustomerDetails id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

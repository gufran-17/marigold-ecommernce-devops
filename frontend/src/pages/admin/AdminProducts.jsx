import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import { Button, ConfirmDialog, ErrorState, Pagination, TableSkeleton } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { adminApi } from '../../api';
import { firstImage } from '../../utils/image';
import { errorMessage, formatPrice } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);
  const { data, loading, error, reload, setData } = useAsync(() => adminApi.products({ page, limit: 10, search: debounced }), [page, debounced]);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const toggle = async (p) => {
    setBusyId(p._id);
    try {
      const { product } = await adminApi.toggleProduct(p._id);
      setData((d) => ({ ...d, products: d.products.map((x) => (x._id === product._id ? product : x)) }));
      toast.success(product.isActive ? 'Product activated' : 'Product deactivated');
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setBusyId(null); }
  };

  const remove = async () => {
    setBusyId(toDelete._id);
    try {
      await adminApi.deleteProduct(toDelete._id);
      toast.success('Product deleted');
      reload();
    } catch (e) { toast.error(errorMessage(e)); }
    finally { setBusyId(null); setToDelete(null); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-extrabold">Products</h1><Link to="/admin/products/new"><Button><Plus className="h-4 w-4" />Add product</Button></Link></div>
      <div className="card">
        <div className="p-4"><AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, SKU or brand" /></div>
        {loading ? <TableSkeleton /> : error ? <ErrorState onRetry={reload} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data.products.map((p) => (
                  <tr key={p._id}>
                    <td className="flex items-center gap-3 px-4 py-3"><img src={firstImage(p)} alt="" className="h-11 w-11 rounded-lg object-cover" /><div className="min-w-0"><p className="truncate font-semibold">{p.name}</p><p className="text-xs text-ink-muted">SKU {p.sku}</p></div></td>
                    <td className="px-4 py-3 text-ink-soft">{p.category ? p.category.name : '—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(p.discountPrice || p.price)}</td>
                    <td className="px-4 py-3">{p.stock <= p.lowStockThreshold ? <span className="font-bold text-sale">{p.stock}</span> : p.stock}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-brand-light text-brand-dark' : 'bg-surface-alt text-ink-muted'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggle(p)} disabled={busyId === p._id} aria-label={p.isActive ? 'Deactivate' : 'Activate'} className="rounded-lg p-2 text-ink-soft hover:bg-surface-alt">{p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                        <Link to={`/admin/products/${p._id}/edit`} aria-label="Edit" className="rounded-lg p-2 text-ink-soft hover:bg-surface-alt"><Edit className="h-4 w-4" /></Link>
                        <button onClick={() => setToDelete(p)} aria-label="Delete" className="rounded-lg p-2 text-sale hover:bg-sale-light"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.products.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-muted">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div className="px-4 pb-4"><Pagination pagination={data.pagination} onChange={setPage} /></div>}
      </div>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete product?" message={toDelete && `"${toDelete.name}" will be permanently removed.`} confirmLabel="Delete" danger loading={!!busyId} onConfirm={remove} />
    </div>
  );
}

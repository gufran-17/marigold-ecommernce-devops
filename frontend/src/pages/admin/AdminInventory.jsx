import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import { ErrorState, Select, TableSkeleton, Pagination } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { adminApi } from '../../api';
import { firstImage } from '../../utils/image';
import { errorMessage } from '../../utils/format';
import { toast } from '../../utils/toast';

function StockCell({ product, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(product.stock);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try { const { product: updated } = await adminApi.updateStock(product._id, Number(value)); onSaved(updated); toast.success('Stock updated'); setEditing(false); }
    catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); }
  };

  if (!editing) {
    const low = product.stock <= product.lowStockThreshold && product.stock > 0;
    const out = product.stock === 0;
    return (
      <button onClick={() => setEditing(true)} className={`flex items-center gap-1.5 font-semibold ${out ? 'text-sale' : low ? 'text-marigold-dark' : 'text-ink'}`}>
        {product.stock} <Pencil className="h-3 w-3 opacity-50" />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className="input w-20 py-1" autoFocus />
      <button onClick={save} disabled={busy} aria-label="Save stock" className="rounded-lg bg-brand p-1.5 text-white"><Check className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export default function AdminInventory() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search);
  const { data, loading, error, reload, setData } = useAsync(() => adminApi.inventory({ page, limit: 15, search: debounced, filter: filter || undefined }), [page, debounced, filter]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">Inventory</h1>
      {data && <div className="mb-4 flex gap-4 text-sm"><span className="font-semibold text-marigold-dark">{data.summary.lowCount} low stock</span><span className="font-semibold text-sale">{data.summary.outCount} out of stock</span></div>}
      <div className="card">
        <div className="p-4"><AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or SKU">
          <Select aria-label="Filter" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} placeholder="All products" options={[{ value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} />
        </AdminToolbar></div>
        {loading ? <TableSkeleton /> : error ? <ErrorState onRetry={reload} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted"><th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Brand</th><th className="px-4 py-3">Stock</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data.products.map((p) => (
                  <tr key={p._id}>
                    <td className="flex items-center gap-3 px-4 py-3"><img src={firstImage(p)} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-semibold">{p.name}</span></td>
                    <td className="px-4 py-3 text-ink-soft">{p.sku}</td>
                    <td className="px-4 py-3 text-ink-soft">{p.brand}</td>
                    <td className="px-4 py-3"><StockCell product={p} onSaved={(u) => setData((d) => ({ ...d, products: d.products.map((x) => (x._id === u._id ? u : x)) }))} /></td>
                  </tr>
                ))}
                {data.products.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-muted">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && <div className="px-4 pb-4"><Pagination pagination={data.pagination} onChange={setPage} /></div>}
      </div>
    </div>
  );
}

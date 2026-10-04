import { useState } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button, ConfirmDialog, ErrorState, Input, Modal, TableSkeleton, Textarea } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi } from '../../api';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

const empty = { name: '', description: '' };

export default function AdminCategories() {
  const { data, loading, error, reload } = useAsync(() => adminApi.categories().then((d) => d.categories), []);
  const [modal, setModal] = useState(null); // { mode: 'new'|'edit', category }
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const openNew = () => { setForm(empty); setErrors({}); setModal({ mode: 'new' }); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setErrors({}); setModal({ mode: 'edit', category: c }); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      if (modal.mode === 'new') await adminApi.createCategory(form);
      else await adminApi.updateCategory(modal.category._id, form);
      toast.success(modal.mode === 'new' ? 'Category created' : 'Category updated');
      setModal(null); reload();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try { await adminApi.deleteCategory(toDelete._id); toast.success('Category deleted'); reload(); }
    catch (e) { toast.error(errorMessage(e, 'Move or delete its products first')); }
    finally { setBusy(false); setToDelete(null); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-extrabold">Categories</h1><Button onClick={openNew}><Plus className="h-4 w-4" />Add category</Button></div>
      <div className="card">
        {loading ? <TableSkeleton /> : error ? <ErrorState onRetry={reload} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Products</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">
                {data.map((c) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-ink-soft">{c.description}</td>
                    <td className="px-4 py-3">{c.productCount}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => openEdit(c)} aria-label="Edit" className="rounded-lg p-2 text-ink-soft hover:bg-surface-alt"><Edit className="h-4 w-4" /></button><button onClick={() => setToDelete(c)} aria-label="Delete" className="rounded-lg p-2 text-sale hover:bg-sale-light"><Trash2 className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-muted">No categories yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal && modal.mode === 'new' ? 'Add category' : 'Edit category'} footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button loading={busy} onClick={submit}>Save</Button></>}>
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} />
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete category?" message={toDelete && `"${toDelete.name}" will be deleted. This fails if it still has products.`} confirmLabel="Delete" danger loading={busy} onConfirm={remove} />
    </div>
  );
}

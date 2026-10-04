import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Button, Input, PageLoader, Select, Textarea } from '../../components/ui';
import useAsync from '../../hooks/useAsync';
import { adminApi } from '../../api';
import { imageUrl } from '../../utils/image';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

const empty = {
  name: '', description: '', category: '', brand: '', price: '', discountPrice: '', stock: '', sku: '',
  images: [], specifications: [], features: [], isFeatured: false, isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const { data: categories } = useAsync(() => adminApi.categories().then((d) => d.categories), []);
  const existing = useAsync(() => (editing ? adminApi.product(id).then((d) => d.product) : Promise.resolve(null)), [id]);

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existing.data) {
      const p = existing.data;
      setForm({
        name: p.name, description: p.description, category: p.category ? p.category._id || p.category : '', brand: p.brand,
        price: p.price, discountPrice: p.discountPrice ?? '', stock: p.stock, sku: p.sku,
        images: p.images, specifications: p.specifications, features: p.features, isFeatured: p.isFeatured, isActive: p.isActive,
      });
    }
  }, [existing.data]);

  if (editing && existing.loading) return <PageLoader />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const uploadImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const { images } = await adminApi.uploadImages(files);
      setForm((f) => ({ ...f, images: [...f.images, ...images] }));
    } catch (err) {
      toast.error(errorMessage(err, 'Could not upload images'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const setSpec = (i, k, v) => setForm((f) => ({ ...f, specifications: f.specifications.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const removeSpec = (i) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));

  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, ''] }));
  const setFeature = (i, v) => setForm((f) => ({ ...f, features: f.features.map((x, idx) => (idx === i ? v : x)) }));
  const removeFeature = (i) => setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    const payload = {
      ...form,
      price: Number(form.price), stock: Number(form.stock),
      discountPrice: form.discountPrice === '' ? null : Number(form.discountPrice),
      specifications: form.specifications.filter((s) => s.key && s.value),
      features: form.features.filter(Boolean),
    };
    try {
      if (editing) await adminApi.updateProduct(id, payload);
      else await adminApi.createProduct(payload);
      toast.success(editing ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err, 'Please check the form for errors'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold">{editing ? 'Edit product' : 'Add product'}</h1>
      <form onSubmit={submit} noValidate className="mt-6 space-y-6">
        <div className="card space-y-4 p-5">
          <h2 className="font-bold">Basic information</h2>
          <Input label="Product name" required value={form.name} onChange={set('name')} error={errors.name} />
          <Textarea label="Description" required value={form.description} onChange={set('description')} error={errors.description} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" required placeholder="Select category" value={form.category} onChange={set('category')} error={errors.category} options={(categories || []).map((c) => ({ value: c._id, label: c.name }))} />
            <Input label="Brand" required value={form.brand} onChange={set('brand')} error={errors.brand} />
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="font-bold">Pricing & inventory</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input label="Price (₹)" type="number" min="0" required value={form.price} onChange={set('price')} error={errors.price} />
            <Input label="Discount price (₹)" type="number" min="0" value={form.discountPrice} onChange={set('discountPrice')} error={errors.discountPrice} />
            <Input label="Stock" type="number" min="0" required value={form.stock} onChange={set('stock')} error={errors.stock} />
            <Input label="SKU" required value={form.sku} onChange={set('sku')} error={errors.sku} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="accent-brand" />Feature on homepage</label>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="font-bold">Images</h2>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, i) => (
              <div key={img.url + i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-line">
                <img src={imageUrl(img.url)} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} aria-label="Remove image" className="absolute right-0.5 top-0.5 rounded-full bg-ink/70 p-0.5 text-white"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-ink-muted hover:border-brand hover:text-brand">
              <UploadCloud className="h-5 w-5" /><span className="text-[10px] font-semibold">{uploading ? 'Uploading…' : 'Upload'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={uploadImages} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-bold">Specifications</h2>
          {form.specifications.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" placeholder="Name (e.g. RAM)" value={s.key} onChange={(e) => setSpec(i, 'key', e.target.value)} />
              <input className="input" placeholder="Value (e.g. 8GB)" value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} />
              <button type="button" onClick={() => removeSpec(i)} aria-label="Remove specification" className="rounded-lg p-2 text-sale hover:bg-sale-light"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addSpec}><Plus className="h-4 w-4" />Add specification</Button>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-bold">Features</h2>
          {form.features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" placeholder="Feature highlight" value={f} onChange={(e) => setFeature(i, e.target.value)} />
              <button type="button" onClick={() => removeFeature(i)} aria-label="Remove feature" className="rounded-lg p-2 text-sale hover:bg-sale-light"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addFeature}><Plus className="h-4 w-4" />Add feature</Button>
        </div>

        <div className="flex gap-3"><Button type="submit" loading={busy}>{editing ? 'Save changes' : 'Create product'}</Button><Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>Cancel</Button></div>
      </form>
    </div>
  );
}

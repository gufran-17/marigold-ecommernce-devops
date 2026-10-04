import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, KeyRound } from 'lucide-react';
import { Button, ConfirmDialog, Input } from '../../components/ui';
import { setAddresses, updateProfile } from '../../features/authSlice';
import { userApi } from '../../api';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

const emptyAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' };

function AddressCard({ address, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const remove = async () => {
    setBusy(true);
    try { const res = await userApi.deleteAddress(address._id); dispatch(setAddresses(res.addresses)); toast.success('Address removed'); onDelete(); }
    catch (e) { toast.error(errorMessage(e)); }
    finally { setBusy(false); setConfirmOpen(false); }
  };
  return (
    <div className="card relative p-4">
      {address.isDefault && <span className="absolute right-3 top-3 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-dark">Default</span>}
      <p className="text-sm font-bold">{address.fullName}</p>
      <p className="text-sm text-ink-soft">{address.phone}</p>
      <p className="mt-1 text-sm text-ink-soft">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.postalCode}</p>
      <button onClick={() => setConfirmOpen(true)} className="mt-3 flex items-center gap-1 text-xs font-semibold text-sale hover:underline"><Trash2 className="h-3.5 w-3.5" />Remove</button>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Remove address?" message="This address will be deleted from your account." confirmLabel="Remove" danger loading={busy} onConfirm={remove} />
    </div>
  );
}

function AddAddressForm({ onDone }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add new address</Button>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      const res = await userApi.addAddress(form);
      dispatch(setAddresses(res.addresses));
      toast.success('Address added');
      setForm(emptyAddress); setOpen(false); onDone();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <Input label="Full name" required value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
      <Input label="Phone number" required value={form.phone} onChange={set('phone')} error={errors.phone} />
      <Input label="Address line 1" required value={form.line1} onChange={set('line1')} error={errors.line1} />
      <Input label="Address line 2 (optional)" value={form.line2} onChange={set('line2')} />
      <div className="grid grid-cols-2 gap-3"><Input label="City" required value={form.city} onChange={set('city')} error={errors.city} /><Input label="State" required value={form.state} onChange={set('state')} error={errors.state} /></div>
      <Input label="Postal code" required value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} />
      <div className="flex gap-2"><Button type="submit" loading={busy}>Save address</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
    </form>
  );
}

export default function Profile() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await dispatch(updateProfile(form)).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">My profile</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <form onSubmit={submit} className="card space-y-4 p-5">
            <h2 className="font-bold">Personal information</h2>
            <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <Input label="Email" value={user.email} disabled />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
            <Button type="submit" loading={busy}>Save changes</Button>
          </form>
          <div className="card p-5">
            <h2 className="font-bold">Security</h2>
            <p className="mt-1 text-sm text-ink-muted">Update your password regularly to keep your account secure.</p>
            <Link to="/profile/password"><Button variant="outline" className="mt-3"><KeyRound className="h-4 w-4" />Change password</Button></Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-bold">Saved addresses</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {user.addresses.map((a) => <AddressCard key={a._id} address={a} onDelete={() => force((n) => n + 1)} />)}
          </div>
          <div className="mt-3"><AddAddressForm onDone={() => force((n) => n + 1)} /></div>
        </div>
      </div>
    </div>
  );
}

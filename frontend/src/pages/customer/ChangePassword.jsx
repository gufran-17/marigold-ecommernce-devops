import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { userApi } from '../../api';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await userApi.changePassword(form);
      toast.success('Password changed successfully');
      navigate('/profile');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page max-w-md py-6 sm:py-8">
      <Link to="/profile" className="text-sm font-semibold text-brand hover:underline">← Back to profile</Link>
      <h1 className="mt-3 text-2xl font-extrabold">Change password</h1>
      <form onSubmit={submit} noValidate className="card mt-6 space-y-4 p-5">
        <Input label="Current password" type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={errors.currentPassword} />
        <Input label="New password" type="password" required hint="At least 8 characters, with a letter and a number" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={errors.newPassword} />
        <Button type="submit" loading={busy} className="w-full">Update password</Button>
      </form>
    </div>
  );
}

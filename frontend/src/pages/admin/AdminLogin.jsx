import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { adminLogin } from '../../features/authSlice';
import { errorMessage } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  if (user && user.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await dispatch(adminLogin(form)).unwrap();
      navigate('/admin');
    } catch (error) {
      const message = errorMessage(error, 'Incorrect email or password');
      setErr(message); toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-white"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand"><ShieldCheck className="h-6 w-6" /></span><h1 className="mt-3 text-xl font-extrabold">Admin panel</h1><p className="text-sm text-white/60">Marigold store management</p></div>
        <form onSubmit={submit} noValidate className="card space-y-4 p-6">
          <Input label="Admin email" type="email" required autoFocus value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {err && <p role="alert" className="text-sm font-medium text-sale">{err}</p>}
          <Button type="submit" loading={busy} className="w-full">Log in</Button>
        </form>
      </div>
    </div>
  );
}

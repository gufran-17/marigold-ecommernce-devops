import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '../../components/auth/AuthLayout';
import { Button, Input } from '../../components/ui';
import { login } from '../../features/authSlice';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await dispatch(login(form)).unwrap();
      toast.success('Welcome back');
      navigate((location.state && location.state.from) || '/');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err, 'Incorrect email or password'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Log in to your account" subtitle="Welcome back to Marigold" footer={<>New here? <Link to="/register" className="link">Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <div>
          <Input label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
          <Link to="/forgot-password" className="mt-1.5 inline-block text-xs font-semibold text-brand hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={busy} className="w-full">Log in</Button>
      </form>
    </AuthLayout>
  );
}

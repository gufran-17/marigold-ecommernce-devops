import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '../../components/auth/AuthLayout';
import { Button, Input } from '../../components/ui';
import { register } from '../../features/authSlice';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await dispatch(register(form)).unwrap();
      toast.success('Account created. Welcome to Marigold!');
      navigate('/');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err, 'Could not create your account'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join Marigold in less than a minute" footer={<>Already have an account? <Link to="/login" className="link">Log in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Full name" autoComplete="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="Password" type="password" autoComplete="new-password" required hint="At least 8 characters, with a letter and a number" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
        <Button type="submit" loading={busy} className="w-full">Create account</Button>
        <p className="text-center text-xs text-ink-muted">By continuing you agree to our Terms and Privacy Policy.</p>
      </form>
    </AuthLayout>
  );
}

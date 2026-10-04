import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { Button, Input } from '../../components/ui';
import { authApi } from '../../api';
import { errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      await authApi.reset({ token, password });
      toast.success('Password updated. Please log in.');
      navigate('/login');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err, 'This reset link may have expired'));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset link missing" subtitle="This page needs a valid reset link">
        <p className="text-sm text-ink-soft">Please request a new password reset link.</p>
        <Link to="/forgot-password" className="link mt-3 inline-block text-sm">Request a new link</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="New password" type="password" autoComplete="new-password" required hint="At least 8 characters, with a letter and a number" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Button type="submit" loading={busy} className="w-full">Update password</Button>
      </form>
    </AuthLayout>
  );
}

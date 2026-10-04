import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { Button, Input } from '../../components/ui';
import { authApi } from '../../api';
import { errorMessage } from '../../utils/format';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const res = await authApi.forgot({ email });
      setSent(true);
      if (res.devResetToken) setDevToken(res.devResetToken);
    } catch (error) {
      setErr(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to reset it" footer={<>Remembered it? <Link to="/login" className="link">Log in</Link></>}>
      {sent ? (
        <div className="space-y-3">
          <p className="rounded-lg bg-brand-light p-4 text-sm font-semibold text-brand-dark">If an account exists for {email}, a reset link is on its way.</p>
          {devToken && (
            <div className="rounded-lg border border-line bg-surface p-3 text-xs text-ink-soft">
              <p className="font-semibold text-ink">Development mode: no email service is set up.</p>
              <p className="mt-1">Use this link to continue: <Link className="link break-all" to={`/reset-password?token=${devToken}`}>Reset your password</Link></p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
          <Button type="submit" loading={busy} className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}

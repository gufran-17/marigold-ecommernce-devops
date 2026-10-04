import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button, Input, Textarea } from '../../components/ui';
import { toast } from '../../utils/toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || !form.message) return toast.error('Please fill in all fields with a valid email');
    setSent(true);
    toast.success('Message sent. We will get back to you soon.');
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-extrabold">Contact us</h1>
          <p className="mt-3 text-ink-soft">Questions about an order or a product? Send a message and our team will respond within one business day.</p>
          <ul className="mt-6 space-y-3 text-sm text-ink-soft">
            <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-brand" />support@marigold.example</li>
            <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-brand" />+91 22 4000 1234</li>
            <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-brand" />Mumbai, Maharashtra, India</li>
          </ul>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          {sent ? <p className="rounded-lg bg-brand-light p-4 text-sm font-semibold text-brand-dark">Thanks, {form.name}. We received your message.</p> : (
            <>
              <Input label="Your name" value={form.name} onChange={set('name')} required />
              <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
              <Textarea label="Message" value={form.message} onChange={set('message')} required />
              <Button type="submit" className="w-full">Send message</Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

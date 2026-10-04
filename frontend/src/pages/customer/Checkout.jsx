import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, CreditCard, MapPin, Plus, Truck, Wallet } from 'lucide-react';
import { Button, EmptyState, Input, PageLoader } from '../../components/ui';
import { setAddresses } from '../../features/authSlice';
import { resetCart } from '../../features/cartSlice';
import { userApi, orderApi } from '../../api';
import { firstImage } from '../../utils/image';
import { formatPrice, errorMessage, fieldErrors } from '../../utils/format';
import { toast } from '../../utils/toast';

const emptyAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'India' };

function AddressForm({ onSaved, onCancel }) {
  const [form, setForm] = useState(emptyAddress);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({});
    try {
      const res = await userApi.addAddress(form);
      dispatch(setAddresses(res.addresses));
      toast.success('Address added');
      onSaved(res.addresses[res.addresses.length - 1]);
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
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" required value={form.city} onChange={set('city')} error={errors.city} />
        <Input label="State" required value={form.state} onChange={set('state')} error={errors.state} />
      </div>
      <Input label="Postal code" required value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} />
      <div className="flex gap-2 pt-1">
        <Button type="submit" loading={busy}>Save address</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

const steps = ['Address', 'Review', 'Payment'];

export default function Checkout() {
  const { items, summary, loaded } = useSelector((s) => s.cart);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addAddress, setAddAddress] = useState(user.addresses.length === 0);
  const [addressId, setAddressId] = useState((user.addresses.find((a) => a.isDefault) || user.addresses[0] || {})._id);
  const [method, setMethod] = useState('COD');
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const address = user.addresses.find((a) => a._id === addressId);

  if (!loaded) return <PageLoader />;
  if (items.length === 0) {
    return <div className="container-page py-14"><EmptyState title="Your cart is empty" message="Add a few items before checking out." action={<Link to="/products"><Button>Shop now</Button></Link>} /></div>;
  }

  const canReview = !!address;
  const place = async () => {
    setBusy(true); setErr('');
    try {
      const paymentDetails = method === 'MOCK_CARD' ? { cardNumber: card.cardNumber } : method === 'MOCK_UPI' ? { upiId: upi } : {};
      const { order } = await orderApi.create({ shippingAddress: { ...address }, paymentMethod: method, paymentDetails });
      dispatch(resetCart());
      toast.success('Order placed successfully');
      navigate(`/order-success/${order._id}`);
    } catch (e) {
      setErr(errorMessage(e, 'Could not place your order'));
      toast.error(errorMessage(e, 'Could not place your order'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <ol className="mt-5 flex items-center gap-2 text-sm font-semibold" aria-label="Checkout steps">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${i <= step ? 'bg-brand text-white' : 'bg-surface-alt text-ink-muted'}`}>{i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}</span>
            <span className={i <= step ? 'text-ink' : 'text-ink-muted'}>{s}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-8 bg-line sm:w-16" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {step === 0 && (
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-bold"><MapPin className="h-5 w-5 text-brand" />Shipping address</h2>
              {user.addresses.length > 0 && !addAddress && (
                <div className="mt-4 space-y-2" role="radiogroup" aria-label="Choose address">
                  {user.addresses.map((a) => (
                    <label key={a._id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${addressId === a._id ? 'border-brand bg-brand-light/40' : 'border-line'}`}>
                      <input type="radio" name="addr" className="mt-1 accent-brand" checked={addressId === a._id} onChange={() => setAddressId(a._id)} />
                      <span className="text-sm"><span className="font-bold">{a.fullName}</span> · {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}</span>
                    </label>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setAddAddress(true)}><Plus className="h-4 w-4" />Add new address</Button>
                </div>
              )}
              {addAddress && <div className="mt-4"><AddressForm onSaved={(a) => { setAddressId(a._id); setAddAddress(false); }} onCancel={() => setAddAddress(false)} /></div>}
              {!addAddress && <Button className="mt-5" disabled={!canReview} onClick={() => setStep(1)}>Continue to review</Button>}
            </div>
          )}

          {step === 1 && (
            <div className="card p-5">
              <h2 className="font-bold">Review your order</h2>
              <ul className="mt-4 divide-y divide-line">
                {items.map((i) => (
                  <li key={i.product._id} className="flex items-center gap-3 py-3">
                    <img src={firstImage(i.product)} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1 text-sm"><p className="font-semibold">{i.product.name}</p><p className="text-ink-muted">Qty {i.quantity}</p></div>
                    <p className="text-sm font-bold">{formatPrice(i.product.finalPrice * i.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2"><Button variant="ghost" onClick={() => setStep(0)}>Back</Button><Button onClick={() => setStep(2)}>Continue to payment</Button></div>
            </div>
          )}

          {step === 2 && (
            <div className="card p-5">
              <h2 className="flex items-center gap-2 font-bold"><Wallet className="h-5 w-5 text-brand" />Payment method</h2>
              <div className="mt-4 space-y-2" role="radiogroup" aria-label="Payment method">
                {[{ id: 'COD', label: 'Cash on Delivery', icon: Truck }, { id: 'MOCK_UPI', label: 'UPI', icon: Wallet }, { id: 'MOCK_CARD', label: 'Credit / Debit Card', icon: CreditCard }].map(({ id, label, icon: Icon }) => (
                  <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${method === id ? 'border-brand bg-brand-light/40' : 'border-line'}`}>
                    <input type="radio" name="pay" className="accent-brand" checked={method === id} onChange={() => setMethod(id)} />
                    <Icon className="h-4 w-4 text-ink-soft" /><span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
              {method === 'MOCK_UPI' && <Input className="mt-4" label="UPI ID" placeholder="name@upi" value={upi} onChange={(e) => setUpi(e.target.value)} hint="This is a simulated payment - use any value like test@upi" />}
              {method === 'MOCK_CARD' && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Input className="col-span-2" label="Card number" placeholder="4242 4242 4242 4242" value={card.cardNumber} onChange={(e) => setCard({ ...card, cardNumber: e.target.value })} hint="Simulated - any 16 digit number not ending in 0000 succeeds" />
                  <Input label="Expiry" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                  <Input label="CVV" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                </div>
              )}
              {err && <p role="alert" className="mt-3 text-sm font-medium text-sale">{err}</p>}
              <div className="mt-5 flex gap-2"><Button variant="ghost" onClick={() => setStep(1)}>Back</Button><Button loading={busy} onClick={place}>Place order</Button></div>
            </div>
          )}
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{formatPrice(summary.listTotal)}</dd></div>
            {summary.discount > 0 && <div className="flex justify-between text-brand"><dt>Discount</dt><dd>-{formatPrice(summary.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd>{summary.shippingFee === 0 ? 'Free' : formatPrice(summary.shippingFee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>Total</dt><dd>{formatPrice(summary.totalAmount)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}

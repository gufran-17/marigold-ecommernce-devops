import { useId } from 'react';

function Wrapper({ label, error, hint, id, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="label">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-sale">{error}</p>}
    </div>
  );
}

export function Input({ label, error, hint, className = '', wrapperClassName = '', ...rest }) {
  const id = useId();
  return (
    <Wrapper label={label} error={error} hint={hint} id={id} className={wrapperClassName}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={`input ${error ? 'input-error' : ''} ${className}`} {...rest} />
    </Wrapper>
  );
}

export function Textarea({ label, error, hint, className = '', wrapperClassName = '', ...rest }) {
  const id = useId();
  return (
    <Wrapper label={label} error={error} hint={hint} id={id} className={wrapperClassName}>
      <textarea id={id} rows={4} aria-invalid={!!error} className={`input ${error ? 'input-error' : ''} ${className}`} {...rest} />
    </Wrapper>
  );
}

export function Select({ label, error, hint, options, placeholder, className = '', wrapperClassName = '', ...rest }) {
  const id = useId();
  return (
    <Wrapper label={label} error={error} hint={hint} id={id} className={wrapperClassName}>
      <select id={id} aria-invalid={!!error} className={`input pr-8 ${error ? 'input-error' : ''} ${className}`} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </Wrapper>
  );
}

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders its label and responds to clicks', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows a busy state while loading', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Checkout</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

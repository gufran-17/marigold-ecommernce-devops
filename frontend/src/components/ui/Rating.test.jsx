import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Rating from './Rating';

describe('Rating', () => {
  it('shows "No reviews yet" when count is zero', () => {
    render(<Rating value={0} count={0} />);
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });
  it('shows the average and count when reviews exist', () => {
    render(<Rating value={4.3} count={12} />);
    expect(screen.getByText('4.3')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });
});

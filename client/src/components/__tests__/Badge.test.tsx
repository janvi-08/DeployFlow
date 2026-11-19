import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Active Status</Badge>);
    expect(screen.getByText('Active Status')).toBeInTheDocument();
  });

  it('applies semantic styling for variants', () => {
    const { container } = render(<Badge variant="success">Completed</Badge>);
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });

  it('renders danger variant correctly', () => {
    const { container } = render(<Badge variant="danger">Exceeded</Badge>);
    expect(container.firstChild).toHaveClass('text-rose-800');
  });
});

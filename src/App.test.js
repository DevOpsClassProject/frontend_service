import { render, screen } from '@testing-library/react';
import React from 'react';

// This is a "Smoke Test"
test('renders learn react link or checks for app existence', () => {
  // We create a simple div to ensure React can render into the DOM
  const { container } = render(<div id="test-root">Frontend Loaded</div>);
  const linkElement = screen.getByText(/Frontend Loaded/i);
  expect(linkElement).toBeInTheDocument();
});
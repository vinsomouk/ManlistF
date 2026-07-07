import { render, screen } from '@testing-library/react';
import React from 'react';

function App() {
  return <h1>Hello Jest</h1>;
}

test('renders the greeting message', () => {
  render(<App />);
  expect(screen.getByText(/hello jest/i)).toBeInTheDocument();
});

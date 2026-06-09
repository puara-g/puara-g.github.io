import { render, screen } from '@testing-library/react';
import App from './App';

test('마음서재 로고가 렌더됩니다', () => {
  render(<App />);
  const logo = screen.getByText(/마음서재/i);
  expect(logo).toBeInTheDocument();
});

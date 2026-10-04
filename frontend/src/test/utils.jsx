import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createStore } from '../app/store';

// Render a component with Redux + Router, the same way the real app is wrapped.
export function renderWithProviders(ui, { preloadedState, route = '/' } = {}) {
  const store = createStore(preloadedState);
  return { store, ...render(<MemoryRouter initialEntries={[route]}>
    <Provider store={store}>{ui}</Provider>
  </MemoryRouter>) };
}

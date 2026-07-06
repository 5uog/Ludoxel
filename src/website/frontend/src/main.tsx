/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

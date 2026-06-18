/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';
import RouteScrollRestoration from './routes/RouteScrollRestoration';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <RouteScrollRestoration />
      <AppRoutes />
    </BrowserRouter>
  );
}

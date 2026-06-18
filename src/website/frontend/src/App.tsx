/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { BrowserRouter } from 'react-router-dom';

import SeoMetadata from './components/seo/SeoMetadata';
import AppRoutes from './routes/AppRoutes';
import RouteScrollRestoration from './routes/RouteScrollRestoration';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <SeoMetadata />
      <RouteScrollRestoration />
      <AppRoutes />
    </BrowserRouter>
  );
}

/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter } from 'react-router-dom';

import SeoMetadata from '../features/seo/components/SeoMetadata';
import AppRoutes from './routes/AppRoutes';
import RouteScrollRestoration from './routes/RouteScrollRestoration';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <SeoMetadata />
      <RouteScrollRestoration />
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

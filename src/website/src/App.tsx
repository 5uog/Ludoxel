/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ChangelogPage from './routes/ChangelogPage';
import DocsOverviewPage from './routes/DocsOverviewPage';
import HomePage from './routes/HomePage';
import NotFoundPage from './routes/NotFoundPage';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs/overview" element={<DocsOverviewPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

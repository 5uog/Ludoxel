/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { docsHomeHref } from './data/navigation';
import ChangelogPage from './routes/ChangelogPage';
import DocsPage from './routes/DocsPage';
import HomePage from './routes/HomePage';
import NotFoundPage from './routes/NotFoundPage';

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<Navigate to={docsHomeHref} replace />} />
        <Route path="/docs/overview" element={<Navigate to={docsHomeHref} replace />} />
        <Route path="/docs/:slug" element={<DocsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

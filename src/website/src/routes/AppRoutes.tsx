/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Route, Routes } from 'react-router-dom';

import ChangelogPage from '../pages/ChangelogPage';
import DocsPage from '../pages/DocsPage';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/docs/*" element={<DocsPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

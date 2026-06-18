/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const frontendRoot = fileURLToPath(new URL('./frontend', import.meta.url));
const outputDirectory = fileURLToPath(new URL('./dist', import.meta.url));

export default defineConfig({
  root: frontendRoot,
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 3000,
    emptyOutDir: true,
    outDir: outputDirectory,
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});

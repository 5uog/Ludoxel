/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { createWriteStream } from 'node:fs';
import https from 'node:https';
import tls from 'node:tls';

const DOWNLOAD_TIMEOUT_MS = 30000;

function createDownloadAgent() {
  if (typeof tls.getCACertificates !== 'function') return undefined;
  return new https.Agent({
    ca: [...tls.getCACertificates('default'), ...tls.getCACertificates('system')],
  });
}

const DOWNLOAD_AGENT = createDownloadAgent();

export function downloadFile(url, destination) {
  return new Promise((resolvePromise, rejectPromise) => {
    const request = https.get(url, { agent: DOWNLOAD_AGENT }, (response) => {
      const statusCode = response.statusCode ?? 0;

      if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
        response.resume();
        downloadFile(response.headers.location, destination).then(resolvePromise).catch(rejectPromise);
        return;
      }

      if (statusCode !== 200) {
        response.resume();
        rejectPromise(new Error(`Download failed: ${statusCode} ${url}`));
        return;
      }

      const file = createWriteStream(destination);
      response.pipe(file);

      file.on('finish', () => {
        file.close(resolvePromise);
      });

      file.on('error', (error) => {
        rejectPromise(error);
      });
    });

    request.setTimeout(DOWNLOAD_TIMEOUT_MS, () => {
      request.destroy(new Error(`Download timed out after ${DOWNLOAD_TIMEOUT_MS}ms: ${url}`));
    });

    request.on('error', (error) => {
      rejectPromise(error);
    });
  });
}

/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { buildStructuredData, getSeoMetadata, toCanonicalUrl } from '../../data/seo';

function setNamedMeta(name: string, content: string): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (element === null) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function setPropertyMeta(property: string, content: string): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);

  if (element === null) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function setCanonicalUrl(href: string): void {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (element === null) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function setStructuredData(data: Record<string, unknown>): void {
  const scriptId = 'ludoxel-route-structured-data';
  let element = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (element === null) {
    element = document.createElement('script');
    element.id = scriptId;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

export default function SeoMetadata(): null {
  const location = useLocation();
  const metadata = useMemo(() => getSeoMetadata(location.pathname), [location.pathname]);

  useEffect(() => {
    const canonicalUrl = toCanonicalUrl(metadata.canonicalPath);

    document.title = metadata.title;
    setNamedMeta('description', metadata.description);
    setNamedMeta('robots', 'index, follow');
    setNamedMeta('twitter:title', metadata.title);
    setNamedMeta('twitter:description', metadata.description);
    setPropertyMeta('og:title', metadata.title);
    setPropertyMeta('og:description', metadata.description);
    setPropertyMeta('og:type', metadata.structuredDataType === 'TechArticle' ? 'article' : 'website');
    setPropertyMeta('og:url', canonicalUrl);
    setCanonicalUrl(canonicalUrl);
    setStructuredData(buildStructuredData(metadata));
  }, [metadata]);

  return null;
}

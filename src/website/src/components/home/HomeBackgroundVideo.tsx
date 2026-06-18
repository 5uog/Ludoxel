/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export default function HomeBackgroundVideo(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video className="h-full w-full object-cover opacity-35 motion-reduce:hidden" autoPlay muted loop playsInline preload="metadata">
        <source src="/assets/videos/home-background.webm" type="video/webm" />
        <source src="/assets/videos/home-background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-background/15" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
    </div>
  );
}

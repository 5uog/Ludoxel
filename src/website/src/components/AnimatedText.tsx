/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
type AnimatedTextProps = {
  text: string;
  delayStepMs?: number;
  initialDelayMs?: number;
};

export default function AnimatedText({ text, delayStepMs = 18, initialDelayMs = 0 }: AnimatedTextProps): React.JSX.Element {
  return (
    <span className="animated-text" aria-label={text}>
      {Array.from(text).map((character, index) => (
        <span aria-hidden="true" className="animated-text__char" key={`${character}-${index}`} style={{ animationDelay: `${initialDelayMs + index * delayStepMs}ms` }}>
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </span>
  );
}

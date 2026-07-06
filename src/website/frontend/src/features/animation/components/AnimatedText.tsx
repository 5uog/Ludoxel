/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
type AnimatedTextProps = {
  text: string;
  delayStepMs?: number;
  initialDelayMs?: number;
  animationKey?: string | number;
};

export default function AnimatedText({ text, delayStepMs = 18, initialDelayMs = 0, animationKey = text }: AnimatedTextProps): React.JSX.Element {
  const textAnimationKey = `${animationKey}`;

  return (
    <span className="animated-text" aria-label={text} key={textAnimationKey}>
      {Array.from(text).map((character, index) => (
        <span aria-hidden="true" className="animated-text__char" key={`${textAnimationKey}-${character}-${index}`} style={{ animationDelay: `${initialDelayMs + index * delayStepMs}ms` }}>
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </span>
  );
}

# FILE: src/maiming/presentation/widgets/hud/hud_widget.py
from __future__ import annotations

from dataclasses import dataclass

from PyQt6.QtCore import Qt, QRect
from PyQt6.QtGui import QFont, QFontMetrics
from PyQt6.QtWidgets import QWidget, QLabel

from maiming.presentation.widgets.hud.hud_payload import HudPayload

@dataclass(frozen=True)
class _FitResult:
    text: str
    point_size: int
    w: int
    h: int

class HUDWidget(QWidget):
    """
    HUDWidget renders a single debug panel anchored to the top-left corner.

    The panel width is capped to preserve composition and avoid sprawling overlays.
    Layout fitting is intentionally O(N) in font sizes, and does not perform width searches,
    ensuring that HUD updates never become a dominant cost in the input-to-sim pipeline.
    """
    def __init__(self) -> None:
        super().__init__()

        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self.setAttribute(Qt.WidgetAttribute.WA_NoSystemBackground, True)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)

        self._margin = 10

        self._base_pt = 14
        self._min_pt = 8

        self._pad_px = 10
        self._border_px = 1

        self._lbl = QLabel(self)
        self._lbl.setObjectName("hud")
        self._lbl.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self._lbl.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self._lbl.setTextFormat(Qt.TextFormat.PlainText)
        self._lbl.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignTop)
        self._lbl.setWordWrap(True)
        self._lbl.setText("")

        self._payload = HudPayload("", "", "", "")
        self._raw_text = ""

    def set_payload(self, payload: HudPayload) -> None:
        self._payload = payload if isinstance(payload, HudPayload) else HudPayload("", "", "", "")
        combined = self._combine_payload(self._payload)
        if str(combined) == str(self._raw_text):
            return
        self._raw_text = str(combined)
        self._lbl.setText(str(self._raw_text))
        self._relayout()

    def resizeEvent(self, _e) -> None:
        self._relayout()

    @staticmethod
    def _combine_payload(p: HudPayload) -> str:
        parts: list[str] = []
        for s in (p.top_left, p.top_right, p.bottom_left, p.bottom_right):
            t = str(s or "").strip()
            if t:
                parts.append(t)
        return "\n\n".join(parts)

    def _relayout(self) -> None:
        w = int(self.width())
        h = int(self.height())
        if w <= 1 or h <= 1:
            return

        m = int(self._margin)
        aw = max(1, w - 2 * m)
        ah = max(1, h - 2 * m)

        panel_cap = int(min(float(w) * 0.60, 860.0))
        panel_w = int(max(320, min(int(aw), int(panel_cap))))

        scale = min(float(w) / 1280.0, float(h) / 720.0)
        scale = max(0.55, min(1.20, float(scale)))

        base_pt = int(round(float(self._base_pt) * scale))
        base_pt = max(int(self._min_pt), min(22, base_pt))

        fit = self._fit_text(self._raw_text, aw=panel_w, ah=ah, base_pt=base_pt, min_pt=int(self._min_pt))

        f = QFont(self._lbl.font())
        f.setPointSize(int(max(1, int(fit.point_size))))
        self._lbl.setFont(f)
        self._lbl.setText(str(fit.text))

        self._lbl.setFixedWidth(int(max(1, min(panel_w, int(fit.w)))))
        self._lbl.setFixedHeight(int(max(1, min(ah, int(fit.h)))))

        self._lbl.move(int(m), int(m))
        self._lbl.raise_()

    def _inner_text_width(self, label_w: int) -> int:
        pad = int(self._pad_px)
        bor = int(self._border_px)
        return max(1, int(label_w) - 2 * (pad + bor))

    def _height_for(self, text: str, font: QFont, label_w: int) -> int:
        raw = str(text or "")
        if not raw.strip():
            return int(2 * (self._pad_px + self._border_px) + 2)

        inner_w = self._inner_text_width(int(label_w))
        fm = QFontMetrics(font)
        r = fm.boundingRect(QRect(0, 0, int(inner_w), 100000), int(Qt.TextFlag.TextWordWrap), raw)

        pad_total = 2 * (int(self._pad_px) + int(self._border_px))
        return int(max(1, int(r.height()) + pad_total + 2))

    def _fit_text(self, text: str, *, aw: int, ah: int, base_pt: int, min_pt: int) -> _FitResult:
        raw = str(text or "")
        if not raw.strip():
            return _FitResult(text="", point_size=int(base_pt), w=1, h=1)

        for pt in range(int(base_pt), int(min_pt) - 1, -1):
            font = QFont(self.font())
            font.setPointSize(int(pt))
            lh = self._height_for(raw, font, int(aw))
            if int(lh) <= int(ah):
                return _FitResult(text=raw, point_size=int(pt), w=int(aw), h=int(lh))

        font = QFont(self.font())
        font.setPointSize(int(min_pt))
        trimmed, th = self._trim_to_height(raw, font, int(aw), int(ah))
        return _FitResult(text=str(trimmed), point_size=int(min_pt), w=int(aw), h=int(th))

    def _trim_to_height(self, text: str, font: QFont, label_w: int, max_label_h: int) -> tuple[str, int]:
        raw = str(text or "")
        if not raw.strip():
            h = int(2 * (self._pad_px + self._border_px) + 2)
            return "", int(min(max_label_h, h))

        inner_w = self._inner_text_width(int(label_w))
        fm = QFontMetrics(font)

        pad_total = 2 * (int(self._pad_px) + int(self._border_px))
        max_text_h = int(max(1, int(max_label_h) - pad_total - 2))

        lines = raw.splitlines()
        if not lines:
            h = self._height_for(raw, font, label_w)
            return raw, int(min(max_label_h, h))

        kept = list(lines)
        while kept:
            cand = "\n".join(kept).strip()
            r = fm.boundingRect(QRect(0, 0, int(inner_w), 100000), int(Qt.TextFlag.TextWordWrap), cand)
            if int(r.height()) <= int(max_text_h):
                h = int(r.height()) + int(pad_total) + 2
                return cand, int(max(1, min(int(max_label_h), h)))
            kept.pop()

        h = int(pad_total) + 2
        return "", int(max(1, min(int(max_label_h), h)))
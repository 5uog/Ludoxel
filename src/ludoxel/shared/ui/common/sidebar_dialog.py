# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from collections.abc import Callable, Sequence

from PyQt6.QtCore import QTimer, Qt
from PyQt6.QtGui import QColor, QPalette
from PyQt6.QtWidgets import QDialog, QFrame, QHBoxLayout, QPushButton, QScrollArea, QSizePolicy, QStackedWidget, QVBoxLayout, QWidget


class SidebarDialogBase(QDialog):

    def __init__(self, parent: QWidget | None = None, *, as_window: bool, root_object_name: str, window_title: str, window_size: tuple[int, int], minimum_window_size: tuple[int, int], panel_minimum_size: tuple[int, int], sidebar_object_name: str, content_object_name: str, stack_object_name: str) -> None:
        super().__init__(parent)

        self.setVisible(False)
        self._deferred_reveal_pending: bool = False
        self._as_window = bool(as_window)

        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
        self.setObjectName(str(root_object_name))
        self.setProperty("detachedWindow", bool(self._as_window))
        if bool(self._as_window):
            self.setWindowFlag(Qt.WindowType.Dialog, True)
            self.setWindowFlag(Qt.WindowType.CustomizeWindowHint, True)
            self.setWindowFlag(Qt.WindowType.WindowTitleHint, True)
            self.setWindowFlag(Qt.WindowType.WindowCloseButtonHint, True)
            self.setWindowModality(Qt.WindowModality.ApplicationModal)
            self.setWindowTitle(str(window_title))
            self.resize(int(window_size[0]), int(window_size[1]))
            self.setMinimumSize(int(minimum_window_size[0]), int(minimum_window_size[1]))
            self.setAutoFillBackground(True)
            self.setAttribute(Qt.WidgetAttribute.WA_OpaquePaintEvent, True)
            palette = self.palette()
            palette.setColor(QPalette.ColorRole.Window, QColor("#181818"))
            palette.setColor(QPalette.ColorRole.Base, QColor("#181818"))
            self.setPalette(palette)

        self._root_layout = QVBoxLayout(self)
        if bool(self._as_window):
            self._root_layout.setContentsMargins(0, 0, 0, 0)
        else:
            self._root_layout.setContentsMargins(32, 28, 32, 28)
            self._root_layout.addStretch(1)
        self._root_layout.setSpacing(0)

        self._panel = QFrame(self)
        self._panel.setObjectName("panel")
        self._panel.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self._panel.setMinimumWidth(int(panel_minimum_size[0]))
        self._panel.setMinimumHeight(int(panel_minimum_size[1]))

        self._panel_layout = QHBoxLayout(self._panel)
        self._panel_layout.setContentsMargins(0, 0, 0, 0)
        self._panel_layout.setSpacing(0)

        self._sidebar = QWidget(self._panel)
        self._sidebar.setObjectName(str(sidebar_object_name))
        self._sidebar.setMinimumWidth(236)
        self._sidebar.setMaximumWidth(280)
        self._sidebar_layout = QVBoxLayout(self._sidebar)
        self._sidebar_layout.setContentsMargins(0, 12, 0, 12)
        self._sidebar_layout.setSpacing(0)

        self._content = QWidget(self._panel)
        self._content.setObjectName(str(content_object_name))
        self._content_layout = QVBoxLayout(self._content)
        self._content_layout.setContentsMargins(18, 18, 18, 18)
        self._content_layout.setSpacing(0)
        self._stack = QStackedWidget(self._content)
        self._stack.setObjectName(str(stack_object_name))
        self._content_layout.addWidget(self._stack, stretch=1)

        self._panel_layout.addWidget(self._sidebar, stretch=2)
        self._panel_layout.addWidget(self._content, stretch=8)

        if bool(self._as_window):
            self._root_layout.addWidget(self._panel, stretch=1)
        else:
            self._root_layout.addWidget(self._panel, alignment=Qt.AlignmentFlag.AlignHCenter)
            self._root_layout.addStretch(1)

    def prepare_to_show(self) -> None:
        if not bool(self._as_window):
            return
        self._deferred_reveal_pending = True
        self.setWindowOpacity(0.0)
        self.winId()
        self.ensurePolished()
        layout = self.layout()
        if layout is not None:
            layout.activate()
        self.adjustSize()
        self.updateGeometry()

    def showEvent(self, event) -> None:
        if bool(self._as_window) and bool(self._deferred_reveal_pending):
            self.setWindowOpacity(0.0)
            QTimer.singleShot(0, self._finish_deferred_reveal)
        super().showEvent(event)

    def _finish_deferred_reveal(self) -> None:
        if not bool(self._deferred_reveal_pending):
            return
        self._deferred_reveal_pending = False
        if not self.isVisible():
            return
        self.setWindowOpacity(1.0)

    def _make_tab_button(self, text: str, index: int, on_selected: Callable[[int], None], parent: QWidget | None = None) -> QPushButton:
        button_parent = self._sidebar if parent is None else parent
        button = QPushButton(str(text), button_parent)
        button.setObjectName("navBtn")
        button.setCheckable(True)
        button.setAutoExclusive(True)
        button.setAutoDefault(False)
        button.setDefault(False)
        button.setFlat(True)
        button.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        button.setFixedHeight(64)
        button.clicked.connect(lambda _checked=False, i=index: on_selected(i))
        return button

    def _make_scroll_page(self, *, viewport_object_name: str | None = "settingsViewport", page_object_name: str = "settingsPage") -> tuple[QScrollArea, QWidget, QVBoxLayout]:
        scroll = QScrollArea(self._stack)
        scroll.setObjectName("settingsScroll")
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        viewport = scroll.viewport()
        if viewport_object_name is not None:
            viewport.setObjectName(str(viewport_object_name))
        viewport.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        viewport.setAutoFillBackground(True)

        host = QWidget(scroll)
        host.setObjectName(str(page_object_name))
        host.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        host.setAutoFillBackground(True)
        layout = QVBoxLayout(host)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(12)
        scroll.setWidget(host)
        return scroll, host, layout

    def _set_stack_page(self, *, index: int, max_index: int, tab_buttons: Sequence[QPushButton]) -> int:
        selected_index = int(max(0, min(int(max_index), int(index))))
        self._stack.setCurrentIndex(selected_index)
        current_page = self._stack.currentWidget()
        if isinstance(current_page, QScrollArea):
            current_page.verticalScrollBar().setValue(0)
            current_page.viewport().update()
            page_host = current_page.widget()
            if page_host is not None:
                page_host.update()
        self._stack.update()
        for button_index, button in enumerate(tab_buttons):
            button.setChecked(int(button_index) == int(selected_index))
        return selected_index

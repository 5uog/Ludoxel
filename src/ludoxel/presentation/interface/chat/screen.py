# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QLineEdit, QPushButton, QStackedWidget, QVBoxLayout, QWidget

from ludoxel.application.chat.messages import ChatMessage
from ludoxel.presentation.interface.chat.candidates_view import ChatCandidateView
from ludoxel.presentation.interface.chat.settings_panel import ChatSettingsPanel
from ludoxel.presentation.interface.chat.text_view import ChatTextView

_BAR_HEIGHT_PX = 56
_BAR_INNER_MARGIN_PX = 8
_SIDE_SLOT_WIDTH_PX = 140


class ChatScreen(QWidget):
  close_requested = pyqtSignal()
  submit_requested = pyqtSignal(str)
  input_changed = pyqtSignal(str)
  settings_requested = pyqtSignal()
  settings_close_requested = pyqtSignal()
  mute_changed = pyqtSignal(bool)
  link_activated = pyqtSignal(str)

  def __init__(self, parent: QWidget | None = None) -> None:
    super().__init__(parent)
    self.setObjectName("chatScreenRoot")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self.setVisible(False)

    root = QVBoxLayout(self)
    root.setContentsMargins(0, 0, 0, 0)
    root.setSpacing(0)

    root.addWidget(self._build_title_bar())
    root.addWidget(self._build_central(), stretch=1)
    root.addWidget(self._build_bottom_bar())

    self._settings_panel = ChatSettingsPanel(self)
    self._settings_panel.back_requested.connect(self.settings_close_requested.emit)
    self._settings_panel.mute_changed.connect(self.mute_changed.emit)

  def _build_title_bar(self) -> QWidget:
    bar = QFrame(self)
    bar.setObjectName("chatTitleBar")
    bar.setFixedHeight(int(_BAR_HEIGHT_PX))
    bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    layout = QHBoxLayout(bar)
    layout.setContentsMargins(int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX))
    layout.setSpacing(0)

    left_slot = QWidget(bar)
    left_slot.setFixedWidth(int(_SIDE_SLOT_WIDTH_PX))
    left_layout = QHBoxLayout(left_slot)
    left_layout.setContentsMargins(0, 0, 0, 0)
    left_layout.setSpacing(0)
    self._back_button = QPushButton("< Back", left_slot)
    self._back_button.setObjectName("chatBackButton")
    self._back_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._back_button.clicked.connect(self.close_requested.emit)
    left_layout.addWidget(self._back_button, alignment=Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
    layout.addWidget(left_slot)

    self._title_label = QLabel("Chat and Commands", bar)
    self._title_label.setObjectName("chatTitleLabel")
    self._title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    layout.addWidget(self._title_label, stretch=1)

    right_slot = QWidget(bar)
    right_slot.setFixedWidth(int(_SIDE_SLOT_WIDTH_PX))
    layout.addWidget(right_slot)
    return bar

  def _build_central(self) -> QWidget:
    self._stack = QStackedWidget(self)
    self._stack.setObjectName("chatCentral")

    self._log = ChatTextView(self._stack, object_name="chatLogText", interactive=True, bottom_anchored=True)
    self._log.link_activated.connect(self.link_activated.emit)
    self._candidates = ChatCandidateView(self._stack)

    self._stack.addWidget(self._log)
    self._stack.addWidget(self._candidates)
    self._stack.setCurrentWidget(self._log)
    return self._stack

  def _build_bottom_bar(self) -> QWidget:
    bar = QFrame(self)
    bar.setObjectName("chatBottomBar")
    bar.setFixedHeight(int(_BAR_HEIGHT_PX))
    bar.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)

    inner = int(_BAR_HEIGHT_PX) - 2 * int(_BAR_INNER_MARGIN_PX)
    layout = QHBoxLayout(bar)
    layout.setContentsMargins(int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX), int(_BAR_INNER_MARGIN_PX))
    layout.setSpacing(int(_BAR_INNER_MARGIN_PX))

    self._settings_button = QPushButton("", bar)
    self._settings_button.setObjectName("chatSettingsButton")
    self._settings_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._settings_button.setFixedSize(int(inner), int(inner))
    self._settings_button.clicked.connect(self.settings_requested.emit)
    layout.addWidget(self._settings_button)

    self._input = QLineEdit(bar)
    self._input.setObjectName("chatInput")
    self._input.setPlaceholderText("Message or /command")
    self._input.textChanged.connect(self.input_changed.emit)
    self._input.returnPressed.connect(self._on_return_pressed)
    layout.addWidget(self._input, stretch=1)

    self._send_button = QPushButton("Send", bar)
    self._send_button.setObjectName("chatSendButton")
    self._send_button.setCursor(Qt.CursorShape.PointingHandCursor)
    self._send_button.setFixedSize(int(inner * 2), int(inner))
    self._send_button.clicked.connect(self._on_send_clicked)
    layout.addWidget(self._send_button)
    return bar

  def _on_return_pressed(self) -> None:
    self.submit_requested.emit(str(self._input.text()))

  def _on_send_clicked(self) -> None:
    self.submit_requested.emit(str(self._input.text()))

  def input_text(self) -> str:
    return str(self._input.text())

  def clear_input(self) -> None:
    self._input.clear()

  def focus_input(self) -> None:
    self._input.setFocus(Qt.FocusReason.OtherFocusReason)

  def set_messages(self, messages: tuple[ChatMessage, ...]) -> None:
    self._log.set_messages(tuple(messages))

  def set_candidates(self, candidates: tuple[str, ...]) -> None:
    self._candidates.set_candidates(tuple(candidates))

  def show_candidates(self, show: bool) -> None:
    self._stack.setCurrentWidget(self._candidates if bool(show) else self._log)

  def settings_open(self) -> bool:
    return bool(self._settings_panel.isVisible())

  def set_settings_open(self, on: bool, *, mute: bool = False) -> None:
    if bool(on):
      self._settings_panel.set_mute(bool(mute))
      self._settings_panel.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))
      self._settings_panel.setVisible(True)
      self._settings_panel.raise_()
      self._settings_panel.setFocus(Qt.FocusReason.OtherFocusReason)
      return
    self._settings_panel.setVisible(False)
    self.focus_input()

  def set_mute(self, value: bool) -> None:
    self._settings_panel.set_mute(bool(value))

  def resizeEvent(self, e) -> None:
    super().resizeEvent(e)
    if self._settings_panel.isVisible():
      self._settings_panel.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))

  def keyPressEvent(self, e) -> None:
    if int(e.key()) == int(Qt.Key.Key_Escape):
      if self._settings_panel.isVisible():
        self.settings_close_requested.emit()
      else:
        self.close_requested.emit()
      e.accept()
      return
    super().keyPressEvent(e)

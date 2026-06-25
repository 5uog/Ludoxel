# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QEvent, QSize, Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QIcon
from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QLineEdit, QPushButton, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

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
  sent_history_requested = pyqtSignal(int)
  input_edited = pyqtSignal()
  candidate_activated = pyqtSignal(str)

  def __init__(self, parent: QWidget | None = None, *, resource_root: Path) -> None:
    super().__init__(parent)
    self._resource_root = Path(resource_root)
    self.setObjectName("chatScreenRoot")
    self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
    self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)
    self.setVisible(False)
    self._candidate_enter_activation = False

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
    self._central = QWidget(self)
    self._central.setObjectName("chatCentral")

    self._log_scroll = QScrollArea(self._central)
    self._log_scroll.setObjectName("chatLogScroll")
    self._log_scroll.setFrameShape(QFrame.Shape.NoFrame)
    self._log_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
    self._log_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
    self._log_scroll.setWidgetResizable(True)
    self._log_scroll.setFocusPolicy(Qt.FocusPolicy.NoFocus)

    self._log = ChatTextView(self._log_scroll, object_name="chatLogText", interactive=True, bottom_anchored=True)
    self._log.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
    self._log.link_activated.connect(self.link_activated.emit)
    self._log_scroll.setWidget(self._log)
    self._candidates = ChatCandidateView(self._central)
    self._candidates.candidate_activated.connect(self.candidate_activated.emit)
    self._candidates.setVisible(False)
    return self._central

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
    self._settings_button.setIcon(QIcon(str(self._resource_root / "assets" / "ui" / "settings" / "cog.svg")))
    self._settings_button.setIconSize(QSize(20, 20))
    self._settings_button.clicked.connect(self.settings_requested.emit)
    layout.addWidget(self._settings_button)

    self._input = QLineEdit(bar)
    self._input.setObjectName("chatInput")
    self._input.setPlaceholderText("Message or /command")
    self._input.setFixedHeight(int(inner))
    self._input.installEventFilter(self)
    self._input.textChanged.connect(self.input_changed.emit)
    self._input.textEdited.connect(self.input_edited.emit)
    self._input.returnPressed.connect(self._on_return_pressed)
    layout.addWidget(self._input, stretch=1)

    self._send_button = QPushButton("Send", bar)
    self._send_button.setObjectName("chatSendButton")
    self._send_button.setProperty("buttonStyle", "prominent")
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

  def cursor_position(self) -> int:
    return int(self._input.cursorPosition())

  def clear_input(self) -> None:
    self._input.clear()

  def set_input_text(self, text: str, *, cursor_position: int | None = None) -> None:
    self._input.setText(str(text))
    if cursor_position is None:
      self._input.setCursorPosition(len(self._input.text()))
    else:
      self._input.setCursorPosition(max(0, min(len(self._input.text()), int(cursor_position))))

  def focus_input(self) -> None:
    self._input.setFocus(Qt.FocusReason.OtherFocusReason)

  def set_messages(self, messages: tuple[ChatMessage, ...]) -> None:
    self._log.set_messages(tuple(messages))
    QTimer.singleShot(0, self._refresh_log_geometry)
    QTimer.singleShot(0, self._scroll_log_to_bottom)

  def set_mention_targets(self, names: tuple[str, ...]) -> None:
    self._log.set_mention_targets(tuple(names))

  def set_candidates(self, candidates: tuple[str, ...]) -> None:
    self._candidates.set_candidates(tuple(candidates))
    if self._candidates.isVisible():
      self._refresh_candidate_geometry()

  def show_candidates(self, show: bool) -> None:
    visible = bool(show) and self._candidates.has_candidates()
    self._candidates.setVisible(bool(visible))
    self._log_scroll.setVisible(not bool(visible))
    if bool(visible):
      self._refresh_candidate_geometry()
      self._candidates.raise_()

  def set_candidate_enter_activation(self, enabled: bool) -> None:
    self._candidate_enter_activation = bool(enabled)

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
    self._refresh_central_geometry()
    self._refresh_log_geometry()
    self._refresh_candidate_geometry()
    if self._settings_panel.isVisible():
      self._settings_panel.setGeometry(0, 0, max(1, int(self.width())), max(1, int(self.height())))

  def eventFilter(self, watched, event) -> bool:
    if watched is self._input and event.type() == QEvent.Type.KeyPress:
      key = int(event.key())
      if self._candidates.isVisible():
        if key == int(Qt.Key.Key_Up):
          self._candidates.move_selection(-1)
          event.accept()
          return True
        if key == int(Qt.Key.Key_Down):
          self._candidates.move_selection(1)
          event.accept()
          return True
        if key == int(Qt.Key.Key_Tab):
          self._candidates.activate_selected()
          event.accept()
          return True
        if bool(self._candidate_enter_activation) and key in (int(Qt.Key.Key_Return), int(Qt.Key.Key_Enter)):
          self._candidates.activate_selected()
          event.accept()
          return True
        if key == int(Qt.Key.Key_Escape):
          self.show_candidates(False)
          event.accept()
          return True
      if key == int(Qt.Key.Key_Up):
        self.sent_history_requested.emit(-1)
        event.accept()
        return True
      if key == int(Qt.Key.Key_Down):
        self.sent_history_requested.emit(1)
        event.accept()
        return True
    return super().eventFilter(watched, event)

  def _refresh_central_geometry(self) -> None:
    if not hasattr(self, "_central"):
      return
    self._log_scroll.setGeometry(0, 0, max(1, int(self._central.width())), max(1, int(self._central.height())))

  def _refresh_log_geometry(self) -> None:
    viewport = self._log_scroll.viewport()
    height = max(int(viewport.height()), int(self._log.content_height()))
    self._log.setFixedHeight(max(1, int(height)))

  def _refresh_candidate_geometry(self) -> None:
    if not self._candidates.isVisible():
      return
    width = max(1, int(self._central.width()))
    height = max(1, int(self._central.height()))
    popup_height = max(1, min(height, int(self._candidates.preferred_height())))
    top = max(0, int(height) - int(popup_height))
    self._candidates.setGeometry(0, int(top), int(width), int(popup_height))

  def _scroll_log_to_bottom(self) -> None:
    bar = self._log_scroll.verticalScrollBar()
    bar.setValue(bar.maximum())

  def keyPressEvent(self, e) -> None:
    if int(e.key()) == int(Qt.Key.Key_Escape):
      if self._settings_panel.isVisible():
        self.settings_close_requested.emit()
      else:
        self.close_requested.emit()
      e.accept()
      return
    super().keyPressEvent(e)

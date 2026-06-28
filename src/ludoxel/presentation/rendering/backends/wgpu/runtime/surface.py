# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

_SRGB_SUFFIX = "-srgb"


def linear_color_target_format(preferred_format) -> str:
  fmt = str(preferred_format)
  if fmt.endswith(_SRGB_SUFFIX):
    return fmt[: -len(_SRGB_SUFFIX)]
  return fmt


def configure_wgpu_canvas(*, canvas, adapter, device):
  import wgpu

  context = canvas.get_context("wgpu")
  target_format = linear_color_target_format(context.get_preferred_format(adapter))
  context.configure(device=device, format=target_format, usage=wgpu.TextureUsage.RENDER_ATTACHMENT, alpha_mode="opaque")
  return context, target_format

# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations


def configure_wgpu_canvas(*, canvas, adapter, device):
  import wgpu

  context = canvas.get_context("wgpu")
  target_format = context.get_preferred_format(adapter)
  context.configure(device=device, format=target_format, usage=wgpu.TextureUsage.RENDER_ATTACHMENT, alpha_mode="opaque")
  return context, target_format

# Copyright 2026 Kento Konishi (https://github.com/5uog)
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

CAMERA_PERSPECTIVE_FIRST_PERSON = "first_person"
CAMERA_PERSPECTIVE_THIRD_PERSON_BACK = "third_person_back"
CAMERA_PERSPECTIVE_THIRD_PERSON_FRONT = "third_person_front"

CAMERA_PERSPECTIVE_ORDER: tuple[str, ...] = (CAMERA_PERSPECTIVE_FIRST_PERSON, CAMERA_PERSPECTIVE_THIRD_PERSON_BACK, CAMERA_PERSPECTIVE_THIRD_PERSON_FRONT)
CAMERA_PERSPECTIVE_LABELS: dict[str, str] = {CAMERA_PERSPECTIVE_FIRST_PERSON: "First Person", CAMERA_PERSPECTIVE_THIRD_PERSON_BACK: "Third Person Back", CAMERA_PERSPECTIVE_THIRD_PERSON_FRONT: "Third Person Front"}

def normalize_camera_perspective(value: object) -> str:
    normalized = str(value).strip().lower()
    if normalized in CAMERA_PERSPECTIVE_LABELS:
        return normalized
    return CAMERA_PERSPECTIVE_FIRST_PERSON

def camera_perspective_display_name(value: object) -> str:
    normalized = normalize_camera_perspective(value)
    return str(CAMERA_PERSPECTIVE_LABELS[normalized])

def cycle_camera_perspective(value: object, step: int = 1) -> str:
    normalized = normalize_camera_perspective(value)
    count = len(CAMERA_PERSPECTIVE_ORDER)
    if count <= 0:
        return CAMERA_PERSPECTIVE_FIRST_PERSON
    index = CAMERA_PERSPECTIVE_ORDER.index(normalized)
    return str(CAMERA_PERSPECTIVE_ORDER[(index + int(step)) % count])

def is_first_person_camera_perspective(value: object) -> bool:
    return normalize_camera_perspective(value) == CAMERA_PERSPECTIVE_FIRST_PERSON
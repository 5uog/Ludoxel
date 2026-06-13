# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

PROFILE_IMAGE_CANDIDATE_NAMES: tuple[str, ...] = ("profile.png", "profile.jpg", "profile.jpeg", "profile.webp", "profile.bmp")
GITHUB_IMAGE_CANDIDATE_NAMES: tuple[str, ...] = ("github.png", "github.jpg", "github.jpeg", "github.webp", "github.bmp", "github.svg")
ABOUT_GITHUB_URL = "https://github.com/5uog/Ludoxel/"

ABOUT_CREATOR_DISPLAY_NAME = "Kento Konishi"
ABOUT_CREATOR_HANDLE = "5uog"
ABOUT_CREATOR_ROLE = "Keio University student / Ludoxel creator"
ABOUT_CREATOR_AGE_LABEL = "Age"
ABOUT_CREATOR_AGE = "20"
ABOUT_CREATOR_PRONOUNCE_LABEL = "Pronounce"
ABOUT_CREATOR_PRONOUNS = "he/him"

ABOUT_PROFILE_TAGS: tuple[str, ...] = ("python", "pyqt6", "opengl", "wgpu", "voxel", "sandbox", "3d-rendering", "state-persistence", "ui-design", "law-and-technology")

ABOUT_PROFILE_BIO_TEXT = """My concern with law and information technology is rooted in experiences that existed before I had the legal vocabulary to describe them. In childhood, I encountered domestic violence and other forms of special harm, including abuse involving forged marriage registration and forged contractual documents. Those events did not leave me with a merely moral objection to wrongdoing. They showed that harm can be maintained through control of documents, signatures, family authority, communication routes, and access to institutions before any court, agency, school, or third party is able to recognize the case as a case.

That experience is the reason I chose to study law. The issue is not only whether the legal system condemns violence, coercion, forgery, or exploitation after the fact. The prior question is whether a victim can reach the field in which law becomes operative. If a person cannot safely consult anyone, preserve evidence, control identification documents, keep a phone, use a network, or contact an outside institution, formal rights may exist while practical access has already collapsed.

```text
Core problem:
  harm before institutional visibility
  isolation before consultation
  documentary abuse through forged or controlled records
  loss of phones, networks, documents, and communication routes
  formal remedies without practical access
  procedure dependent on evidence the victim cannot preserve alone
```

Criminal psychology, psychology, and sociology are indispensable for examining domination, dependency, silence, family structure, and the social conditions under which victims remain unseen. Among the fields related to this problem, however, information science and information technology occupy a more central position in my thinking because they address the architecture of access itself. These fields determine how information is received, transmitted, authenticated, preserved, routed, and delivered to someone who is capable of intervention.

For me, engineering is meaningful when it is tied to access. A user interface is not merely a screen. It can be the first point of contact through which an isolated person reaches society. A receiving system or transmission system is not merely a matter of convenience. It can become a route for disclosure, consultation, emergency contact, or preservation of evidence. Conversely, when a victim has been deprived of devices, networks, documents, or contact with public institutions, legal reform is necessary so that substitute access, protective intervention, and institutional response do not depend on the victim already being free enough to request help.

Ludoxel is not a legal remedy, and it is not presented as a victim-support system. It is my personal software project for disciplining the technical side of this broader concern: explicit state, controlled interfaces, persistent records, inspectable behavior, resource boundaries, and documentation accountable to implementation. The point of engineering here is not technical ornament. It is the practice of building systems in which claims, state, authority, and observable effects can be located, examined, and corrected."""

ABOUT_ETYMOLOGY_PARAGRAPHS: tuple[str, ...] = (
  "The name Ludoxel begins from Latin `ludus`. The term can refer to play, game, school, training, or rule-bound exercise. In this project, the relevant point is not amusement alone, but structured activity under visible rules.",
  "`Voxel` is a technical compound formed from `volumetric and pixel`. It names a discrete unit of volume, fitting a block-based world whose behavior depends on position, adjacency, state, and visible form.",
  "`Ludoxel` combines those references. The name points to rule-bound play inside a voxel construction environment rather than to a generic game title.",
)

__all__ = [
  "ABOUT_CREATOR_AGE",
  "ABOUT_CREATOR_AGE_LABEL",
  "ABOUT_CREATOR_DISPLAY_NAME",
  "ABOUT_CREATOR_HANDLE",
  "ABOUT_CREATOR_PRONOUNCE_LABEL",
  "ABOUT_CREATOR_PRONOUNS",
  "ABOUT_CREATOR_ROLE",
  "ABOUT_ETYMOLOGY_PARAGRAPHS",
  "ABOUT_GITHUB_URL",
  "ABOUT_PROFILE_BIO_TEXT",
  "ABOUT_PROFILE_TAGS",
  "GITHUB_IMAGE_CANDIDATE_NAMES",
  "PROFILE_IMAGE_CANDIDATE_NAMES",
]

<!--
SPDX-FileCopyrightText: 2026 Kento Konishi
SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
-->

# Security Policy

Version: 1.0.0
Initial Publication Date: 2026-06-04
Last Updated: 2026-06-04

This repository is not an open source project and does not accept external code contributions.

This security policy explains how security vulnerabilities may be reported for this repository and for the Ludoxel desktop application. It does not grant any permission to copy, reuse, modify, distribute, deploy, incorporate, relicense, create derivative works from, or represent the repository's Original Materials as one's own work.

## Supported Scope

Only the current public version of this repository and current official Ludoxel desktop distribution artifacts, when published by Kento Konishi, are within the scope of this security policy.

Older commits, archived copies, forks, mirrors, downloaded copies, modified versions, unofficial deployments, and third-party redistributions are not supported.

Security reports may concern repository source code, packaging configuration, native extension build configuration, desktop distribution material, shader/resource loading, app-managed runtime data handling, and dependency-related security issues when those issues materially affect the current repository or official distribution.

## Reporting a Vulnerability

Do not disclose vulnerability details through public issues, public pull requests, public discussions, social media posts, or other public channels.

If GitHub private vulnerability reporting or GitHub Security Advisories are available for this repository, use that private reporting channel.

If no private reporting channel is available, open a minimal public issue only to request a private contact method. Do not include exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, logs containing secrets, local user data, save files, or other vulnerability details in that public issue.

## Report Contents

A useful security report should include:

- a concise description of the suspected vulnerability;
- the affected file, feature, dependency, package, shader, build tool, or distribution artifact, if known;
- clear reproduction steps;
- the expected security impact;
- operating system, Python, Node, PyQt6, OpenGL/GPU, and packaging details where relevant;
- whether the issue affects source-tree execution, editable install, native extension build, Windows packaging, macOS packaging research, or official distribution output.

Do not include unrelated personal data, third-party confidential information, credentials, API keys, session tokens, cookies, private local files, or data obtained from accounts or systems that you are not authorized to access.

## Out-of-Scope Reports

The following reports are generally outside scope:

- feature requests;
- general code quality comments;
- license objections or reuse requests;
- reports about unofficial forks, mirrors, third-party redistributions, or third-party deployments;
- reports requiring unauthorized access, destructive testing, denial of service, spam, social engineering, or physical attacks;
- automated scanner output without a practical explanation of impact.

## Handling

Security reports may be reviewed, accepted, rejected, or closed at the maintainer's discretion.

No fixed response time, remediation time, disclosure schedule, bounty, compensation, credit, or public acknowledgement is promised.

## Testing Restrictions

Security testing must remain limited to lawful, non-destructive, good-faith activity.

Do not use security testing as a basis to copy, scrape, mirror, archive, modify, deploy, redistribute, incorporate, or otherwise reuse the Original Materials.

## Controlling Terms

This document is a security reporting policy. If this document conflicts with [`LICENSE`](../LICENSE), the English text of [`LICENSE`](../LICENSE) controls for the Original Materials.

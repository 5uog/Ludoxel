<!--
SPDX-FileCopyrightText: 2026 Kento Konishi
SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
-->

# Security Reporting Policy

Version: 1.0.2
Initial Publication Date: 2026-06-04
Last Updated: 2026-06-14

This document is the Security Reporting Policy referenced by [`LICENSE`](../LICENSE). It states how a Security Report may be submitted for the Current Repository and for an Official Distribution. It does not grant permission to Use the Original Materials beyond [`LICENSE`](../LICENSE).

## Supported Scope

A Security Report is supported only for the Current Repository and for an Official Distribution.

Older commits, archived copies, forks, mirrors, downloaded copies, modified versions, unofficial deployments, and other third-party redistributions are outside the supported scope and are not an Official Distribution.

A Security Report may concern repository source code, packaging configuration, native extension build configuration, Desktop Distribution material, shader or resource loading, app-managed runtime data handling, or dependency-related security issues when the reported issue materially affects the Current Repository or an Official Distribution.

## Private Reporting Channel

Do not disclose vulnerability details through a Public Issue, a public pull request, a public discussion, social media, or another public channel.

If GitHub private vulnerability reporting or a GitHub security advisory is available for the Repository, use that Private Reporting Channel. If no Private Reporting Channel is available, open only a minimal Public Issue requesting a private contact method. That Public Issue must not include vulnerability details, exploit steps, proof-of-concept code, sensitive URLs, credentials, tokens, cookies, local user data, save files, private local files, or other non-public reproduction information.

## Report Contents

A Security Report submitted through a Private Reporting Channel may include a concise description of the suspected vulnerability; the affected file, feature, dependency, package, shader, build tool, or distribution artifact, if known; reproduction steps necessary to evaluate the issue; the expected security impact; and relevant operating-system, Python, Node, PyQt6, OpenGL/GPU, or packaging details.

Do not include unrelated personal data, third-party confidential information, credentials, API keys, session tokens, cookies, private local files, or data obtained from accounts or systems that the reporter is not authorized to access.

## Out-of-Scope Reports

Feature requests, general code quality comments, license objections, reuse requests, reports about unofficial forks or deployments, reports requiring unauthorized access, destructive testing, denial of service, spam, social engineering, physical attacks, and automated scanner output without a practical explanation of impact are outside this policy.

## Security Testing

Security Testing must remain lawful, non-destructive, good-faith, and limited to systems, accounts, files, and data that the reporter is authorized to test.

Security Testing and the submission of a Security Report do not grant or expand any permission to Use the Original Materials.

## Handling

A Security Report may be reviewed, accepted, rejected, or closed at the Maintainer's discretion. No fixed response time, remediation time, disclosure schedule, bounty, compensation, credit, or public acknowledgement is promised.

## Controlling Terms

This document is the Security Reporting Policy. If this document conflicts with [`LICENSE`](../LICENSE), the License Text controls for the Original Materials. The GitHub Platform Terms may govern GitHub private reporting features and other GitHub service interactions, but those terms do not expand the permissions granted by the Licensor for the Original Materials.

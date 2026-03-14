# Security Policy

## Supported Versions

Only the latest release of Nexus receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a vulnerability, open a [private security advisory](https://github.com/nro337/nexus/security/advisories/new) on GitHub. This allows us to coordinate a fix before any public disclosure.

Include as much of the following as possible:

- Type of vulnerability (e.g. XSS, data leak, dependency CVE)
- File(s) and line numbers related to the issue
- Step-by-step reproduction instructions
- Proof-of-concept or exploit code (if available)
- Potential impact and severity assessment

You can expect an initial response within **72 hours**. We will keep you informed as we work toward a fix and coordinate a responsible disclosure timeline with you.

## Scope

Nexus runs entirely in the browser with no backend server. The main attack surface includes:

- Content Security Policy and XSS in the React UI
- Data stored in IndexedDB (browser sandbox)
- The Chrome Extension (`extension/`) and its messaging bridge
- Third-party npm dependencies

## Out of Scope

- Vulnerabilities in browsers themselves
- Issues requiring physical access to the user's device
- Social engineering attacks

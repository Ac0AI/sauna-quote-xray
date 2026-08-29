# Challenge provenance

This document separates the pre-existing Sauna Guide context from the work created for the 2026 WebMCP Challenge.

## Pre-existing before August 25, 2026

- The Sauna Guide editorial website and `sauna.guide` domain.
- Public buyer research about hidden sauna costs and installation scope.
- The Sauna Guide visual identity and general site navigation.

These provide subject-matter context and the production home for the live route. They are not presented as challenge-period engineering.

## Built during the challenge period

The standalone Sauna Quote X-Ray product was created after the challenge opened:

- The shared, human-editable quote review canvas.
- Eight page-scoped WebMCP tools and their narrow JSON schemas.
- Quote line-item, scope, landed-cost, risk, and contractor-question logic.
- Synthetic demo fixtures that cannot create or submit a customer lead.
- Visible agent activity, reversible mutations, and untrusted-content hints.
- Unit, type, lint, production-build, and Playwright WebMCP journey coverage.
- The standalone Vercel deployment, public MIT repository, screenshots, demo recorder, narration, and reproducible Remotion video source.

## Dated commit evidence

All repository commits begin after the challenge start date:

| Date | Commit | Evidence |
| --- | --- | --- |
| August 27, 2026 | [`740f946`](https://github.com/Ac0AI/sauna-quote-xray/commit/740f946) | Initial working product, eight WebMCP tools, shared canvas, safety model, tests, and MIT repository. |
| August 27, 2026 | [`55cf357`](https://github.com/Ac0AI/sauna-quote-xray/commit/55cf357) | Full TypeScript validation. |
| August 27, 2026 | [`bcec18d`](https://github.com/Ac0AI/sauna-quote-xray/commit/bcec18d) | Public challenge deployment documentation. |
| August 27, 2026 | [`621d9aa`](https://github.com/Ac0AI/sauna-quote-xray/commit/621d9aa) | Submission screenshots, narration, thumbnail, and live demo recorder. |
| August 27, 2026 | [`4b35086`](https://github.com/Ac0AI/sauna-quote-xray/commit/4b35086) | Demo video thumbnail. |
| August 28, 2026 | [`be59318`](https://github.com/Ac0AI/sauna-quote-xray/commit/be59318) | One-minute judge path and reproducible Remotion demo source. |

The first commit timestamp is August 27, 2026. There is no pre-challenge implementation history in this repository.

## Eligible implementation map

- `src/components/QuoteXrayStudio.tsx`: shared human and agent canvas plus WebMCP registrations, schemas, annotations, and execution boundary.
- `src/lib/quote-xray.ts`: synthetic fixtures and quote review logic.
- `src/lib/quote-xray-costs.ts`: public planning ranges used by the visible summary.
- `tests/webmcp-xray.spec.ts`: browser-level WebMCP tool journey and negative-input checks.
- `video/`: reproducible narrated submission video source.

The live app uses synthetic examples only. It does not upload quotes, persist customer data, email anyone, contact a seller, or create a lead.

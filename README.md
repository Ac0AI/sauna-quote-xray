# Sauna Quote X-Ray

> People and AI turn a sauna quote into an honest shared canvas, exposing hidden costs and the exact questions to ask before signing.

Sauna Quote X-Ray is a browser-native WebMCP app created for the [2026 WebMCP Challenge](https://openai.com/webmcp-challenge/). It gives the buyer and their AI agent the same live decision surface instead of hiding agent work in a separate chat transcript.

## Why WebMCP matters here

A sauna quote can look complete while excluding the $600 to $1,800 circuit, a $1,500 to $3,000 panel upgrade, permits, site work, ventilation, or service responsibility. The agent is good at turning messy scope into structure. The human knows what the seller actually promised. WebMCP lets both work on the same visible state.

The agent can load a synthetic quote, inspect the canvas, set project context, add or remove line items, resolve scope, and build contractor questions. The human can edit every amount and status directly. Every change is visible, inspectable, and page-local.

## WebMCP tools

| Tool | What it does |
|---|---|
| `load_demo_sauna_quote` | Loads one of three synthetic reviewer-safe examples. |
| `get_sauna_quote_xray_state` | Reads the exact visible state and marks seller/user text as untrusted. |
| `set_sauna_project_context` | Updates title, location, sauna type, and capacity. |
| `upsert_sauna_quote_line_item` | Adds or corrects one priced quote row by stable ID. |
| `remove_sauna_quote_line_item` | Removes a mistaken or duplicate row. |
| `set_sauna_quote_scope` | Marks up to ten scope items included, excluded, unclear, or not applicable. |
| `build_sauna_contractor_questions` | Builds a visible question list from unresolved scope. |
| `start_sauna_quote_xray` | Clears the demo and starts a blank review. |

None of the tools persist data, upload files, send email, contact sellers, or create leads.

## Try the core demo

Open the live app in a WebMCP-capable browser and ask:

> Load the basement quote. Make the missing electrical work explicit, flag anything still unclear, and build five questions for the contractor. Contact nobody.

Then change a scope status by hand and ask the agent to inspect the canvas again. That round trip is the product: agent speed, human authority, one shared source of truth.

## Challenge-period work

This project was built after the challenge opened on August 25, 2026. The initial functional implementation, safety hardening, browser journey tests, public repository, and deployment were completed on August 27, 2026. Git history preserves the dated work.

## Run locally

Requirements: Node.js 22+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/tools/sauna-quote-xray`. ChatGPT's in-app browser supports WebMCP directly. For Chrome, follow the current challenge instructions or provide a valid `WEBMCP_ORIGIN_TRIAL_TOKEN` in `.env.local`.

## Verify

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

The Playwright journey installs a WebMCP registration harness, invokes all critical tools, checks negative inputs, and proves that agent mutations appear in the visible human canvas. See [TESTING.md](./TESTING.md) for the manual reviewer flow.

## Architecture

```text
WebMCP browser
    -> route-scoped tools
    -> one shared React state/ref
    -> pure quote summary functions
    -> visible ledger, scope, risk range, questions, and activity
```

Public seller price observations and the limited installation ranges live in `src/lib/quote-xray-costs.ts`. Synthetic fixtures and review logic live in `src/lib/quote-xray.ts`. No private customer quotes are included.

## Privacy and safety

- All working state stays in the current tab.
- No quote content is uploaded or persisted.
- No tool can send a request, contact a seller, or create a customer lead.
- The state reader uses `untrustedContentHint: true` for seller- or user-controlled text.
- Schemas reject unknown properties and cap strings, arrays, amounts, and line count.
- The page states where estimates remain unpriced and links to buyer-facing source guides.

See [SECURITY.md](./SECURITY.md) and [NOTICE.md](./NOTICE.md).

## License

[MIT](./LICENSE) © 2026 AC0 AI SLU.

# Reviewer test instructions

Use ChatGPT's in-app browser, or Chrome 149+ with WebMCP enabled.

1. Open the live app and confirm the status says **Agent tools connected**.
2. Ask: “Load the basement quote. Make the missing electrical work explicit, flag anything still unclear, and build five questions for the contractor. Contact nobody.”
3. Confirm the quote ledger, scope cards, projected range, contractor questions, and shared activity update on the visible page.
4. Change one scope status manually. Ask the agent to inspect the canvas again and confirm it sees the human change.
5. Ask the agent to start a blank review, add a $10,000 cabin package, remove it, and inspect the final state.
6. Confirm no network submission, email, storage prompt, or lead confirmation appears.

Automated checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

# Security and privacy

Sauna Quote X-Ray keeps the working state in the current browser tab. It does not upload, persist, email, or submit quote content. It registers page-scoped WebMCP tools only while the X-Ray route is open.

The read tool marks returned quote text with `untrustedContentHint: true`. Mutating tools use narrow schemas, reject unknown fields, cap strings and arrays, and never expose network or lead-submission capabilities.

Report a vulnerability privately to hi@ac0.ai. Do not include real customer quotes or personal data in a report.

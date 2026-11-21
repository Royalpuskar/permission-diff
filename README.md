# Permission Diff

Compare permission manifests and surface added or removed privileges.

**Status:** implemented browser-local research prototype. Automated tests can be reproduced with the command below. GitHub Pages deployed and browser smoke checks completed on 19 November 2026.

## Website

Live website: https://royalpuskar.github.io/permission-diff/

## Declared scope review

[Scope Review page](https://royalpuskar.github.io/permission-diff/scope-review.html) · [Engine](closure.mjs) · [Tests](closure.test.mjs)

Removing a direct grant may leave the same permission reachable through a broader grant. Scope Review compares the transitive closure of two grant sets under **user-declared implications**. It shows effective additions/removals, shortest explanation paths, and permissions that remain reachable after their direct grants were removed.

The dedicated page uses side-by-side Before/After grant fields, an implication editor and an evidence ledger. Enter one grant per line and one `parent → child` (or `parent => child`) rule per line. The line editor reserves those arrow separators; the module API accepts labels directly. A filter narrows the ledger; editing inputs invalidates downloads. Reset restores a synthetic fixture. Export includes the supplied model and results.

```js
import { compareClosure } from './closure.mjs';
const result = compareClosure({
  before: ['admin', 'read'],
  after: ['admin'],
  implications: [
    { from: 'admin', to: 'write' },
    { from: 'write', to: 'read' }
  ]
});
// retainedAfterDirectRemoval: ['read']
// Explanation after change: admin → write → read
```

Multi-source breadth-first traversal produces shortest implication paths. Sorted grants and adjacent labels make ties deterministic independent of rule order. Cycles and duplicate grants/rules are supported. Input is capped at 100000 serialized characters, 200 grants per side, 500 rules and 300 distinct labels. Labels are case-sensitive, trimmed strings of 1–100 characters.

This is a model of declared implications, **not effective authorization in a cloud service**. There are no deny rules, principals, conditions, resource scopes or provider-specific semantics. Wildcards are literal text. Incorrect or incomplete implications produce correspondingly incomplete results. No claims about a real deployment follow.

Validation: all **11 local tests passed**, comprising three original tests and eight new closure tests. The new suite checks retained implied access, revocation, cycles, duplicate edges, deterministic shortest paths, malformed/oversized input and all 64 directed graphs on three labels against a separate fixed-point reachability oracle. UI JavaScript syntax was checked. The new page's deployment, interactions, mobile layout and 3840×2160 layout have not yet been verified.

## Problem and approach

This tool makes the supplied security scenario inspectable through explicit rules, per-item results, and exportable evidence. It runs the same pure JavaScript engine in the browser and Node tests. All input is provided by the user or the included synthetic fixture; no external facts are inferred.

## Implemented features

- Editable scenario with a synthetic example and reset control.
- Deterministic analysis, summary metrics, filterable result table, and JSON report export.
- Input validation, explicit errors, and invalidation of outdated reports after edits.
- Keyboard-accessible controls, responsive layout, and large-screen CSS.
- Zero runtime dependencies and no external API calls.

## Install and run

Requirements: Python 3 for a static local server, Node.js 22 or later for tests.

```sh
git clone https://github.com/Royalpuskar/permission-diff.git
cd permission-diff
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open index.html through a file URL; ES modules require a server.

```sh
node --test test.mjs closure.test.mjs
```

## Example and schema

The complete example in `sample.mjs` defines the supported input shape:

```json
{
  "before": [
    "files:read",
    "notes:read"
  ],
  "after": [
    "files:read",
    "notes:write",
    "network:connect"
  ]
}
```

Edit one value and select **Run analysis**. **Reset example** restores the fixture. **Export report** downloads the current result; it never publishes it.

Input is capped at 200,000 serialized characters, arrays processed by the engine at 500 elements, and numeric magnitudes at 1e12. Domain constraints are checked inside `engine.mjs`; unsupported structures return an error.

## Architecture and request flow

`index.html` loads `app.mjs`, which parses scenario JSON and calls `run` from `engine.mjs`. The engine returns `metrics` and `rows`; the UI renders values with `textContent`, never user-supplied HTML. Editing invalidates the prior report. Export creates a local Blob download.

There is no application authentication, credential store, session cookie, or token lifecycle. GitHub Pages serves public static files. The app does not collect passwords or API keys, contact third-party APIs, persist inputs, or send scenario data over the network. GitHub hosting can still receive ordinary page request metadata. Reloading discards edits.

## Limitations

The original page compares supplied strings only. Scope Review additionally follows declared implications; neither reads cloud policies nor determines real-world effective authorization.

The interface shares a portfolio design system, while this repository has its own domain engine, fixture, and tests. No accuracy, novelty, production-readiness, or 4K visual-test claim is made. Large-screen CSS is not a substitute for device testing.

## Validation

Three local test cases passed on 19 November 2026. Browser checks verified initial results, invalid-input errors, stale-export prevention, and reset. These are smoke checks, not exhaustive browser coverage.

`test.mjs` checks domain outcomes and edge cases, deterministic behavior, input preservation, malformed roots, and size limits. GitHub Actions runs the same suite. Review the tests themselves to see exactly what is covered; passing these checks does not establish security or exhaustive correctness.

## Roadmap

- Add more independently reviewed domain fixtures and explicit schema documentation.
- Add domain-specific form controls alongside the JSON editor.
- Expand accessibility and mobile browser testing.
- Revisit the documented domain limitations before production use.

## Contribution and license

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [LICENSE](LICENSE).

© 2026 Puskar (Royalpuskar). All rights reserved except permissions granted by the MIT license. Preserve applicable third-party notices.

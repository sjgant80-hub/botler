# CLAUDE.md · botler build standard

For Claude and other AI assistants editing this repository.

---

## What botler is

A sovereign personal memory agent. Single HTML file. Runs in the browser. WebLLM in-browser AI. OAuth tokens client-side. No backend ever.

The mission, non-negotiable: "your machine · your data · nobody else involved." Every architectural decision serves that.

This was forked (in spirit) from `si-didy-agent` and stripped to memory-first operation, then re-architected for browser-native (WebLLM + OAuth) because the trust model breaks the moment a third party touches the data.

---

## Architectural constraints

### DO NOT

- ❌ Add a server. ExitEngine, GroundLevel, and botler all share this rule.
- ❌ Add npm / yarn build steps. Vanilla JS only.
- ❌ Add tracking, analytics, telemetry of any kind.
- ❌ Send the OAuth token anywhere except direct to the provider's API.
- ❌ Send the BYOK API key anywhere except direct to the LLM provider.
- ❌ Make WebLLM REQUIRED — T0 (grep mode) must always work without any AI.
- ❌ Require an account / signup / login server.
- ❌ Remove the trust-model paragraph from the home view or README.
- ❌ Allow data to leave the device by default. Network is opt-in per action.
- ❌ Add a paywall / premium tier / "Pro" features.

### DO

- ✅ Treat `localStorage.botler.config` as the config source of truth.
- ✅ Treat `IndexedDB.botler.memory` as the memory source of truth.
- ✅ Every AI feature gracefully degrades: T0 must work for everything.
- ✅ OAuth scopes are READ-ONLY only. Never request `send` or `manage` scopes.
- ✅ Show the AI tier clearly in the top chip · users should always know whether AI is running locally or via API.
- ✅ Make exports complete · users should be able to leave at any moment with their data.
- ✅ Mobile-first. 48px+ tap targets. Test on phone.
- ✅ EU AI Act Article 12 audit shim must remain · log key memory events.

---

## File responsibilities

| File | Purpose | When to modify |
|---|---|---|
| `index.html` | The whole tool | All UI / logic / template changes |
| `sw.js` | Service worker · offline cache | Only when changing cache strategy |
| `manifest.json` | PWA install manifest | Only on icon / name changes |
| `README.md` | User-facing docs | Feature additions, OAuth setup changes |
| `CLAUDE.md` | This file · architectural guardrails | Architectural changes only |
| `LICENSE` | MIT | Never modify |

---

## The 3 tiers (cascade rule)

Every command must work at every tier. If a command depends on AI, document the T0 fallback explicitly:

| Command | T0 (no AI) | T2 (WebLLM) | T3 (BYOK API) |
|---|---|---|---|
| remember | log to memory · auto-extract tags / people / dates via regex | + auto-classify kind via LLM | same as T2 (better quality) |
| whatdid | bullet-list filter by date range | + AI summary of items | same as T2 |
| prep | bullet-list matching items by topic/person | + structured AI brief | same as T2 |
| find | full-text search · grep | optional AI semantic ranking | same as T2 |
| journal | list today's items | + AI markdown daily entry | same as T2 |

NEVER hide a command behind an AI requirement.

---

## Memory model

`memory` IndexedDB store · object schema:

```js
{
  id: 'mem_xxx',          // genId('mem')
  kind: 'daily' | 'project' | 'person' | 'note',
  title: 'string · 60 char max',
  content: 'string · full body',
  ts: 'ISO 8601 timestamp',
  tags: ['array', 'of', 'strings'],
  people: ['Capitalised Names'],
  deadlines: ['June 15', '2026-06-15'],  // raw strings, parse when needed
}
```

Auto-extraction (T0):
- `tags`: anything matching `#\w+`
- `people`: capitalised multi-word names · `Dr|Prof|Mr|Ms|Mrs` prefixes detected
- `deadlines`: month-day-year patterns + ISO dates

DO NOT change this schema without a migration. Memory is the user's data — schema changes must be backward-compatible or ship with auto-migration code.

---

## OAuth implementation rules

- Use PKCE flow always (S256 challenge). Never use implicit flow.
- Store the `code_verifier` in `sessionStorage` (clears on tab close).
- Store the `access_token` in `localStorage.botler.config.oauth.<provider>` with `expires_at`.
- Token refresh: detect 401, force re-auth (no refresh tokens in browser flow for security).
- Each provider's scope list lives in `OAUTH_CONFIG` constant. Readonly only.
- The redirect URI must match `window.location.origin + window.location.pathname`. If users fork the repo to their own GitHub Pages, they must configure their OWN Google OAuth client.

If you add a new OAuth provider (Outlook, iCloud, etc.):
1. Add to `OAUTH_CONFIG`
2. Add a panel in `renderIntegrations()`
3. Add a start function · callback handler · revoke function
4. Stay readonly scope only
5. Update README OAuth setup section

---

## AI cascade rules

- The current tier is `CONFIG.tier` (`T0` / `T2` / `T3`).
- `aiComplete(systemPrompt, userMsg, maxTokens)` is the universal entry point.
- T0 → `aiComplete` returns `null` · caller MUST fall back to non-AI logic.
- T2 → uses `STATE.ai.engine` (MLCEngine). Lazy-loaded · ~2GB download.
- T3 → direct fetch to Anthropic / OpenAI / Google API. Key from `CONFIG.api_key`.

NEVER:
- proxy the API key through any backend
- store the API key anywhere except `localStorage.botler.config`
- log the API key (even in console.error)

---

## Testing

Before commit:
1. Open `index.html` from `file://` — boots cleanly
2. Test all 5 commands at T0 — every command returns useful output
3. Add a memory item — appears in Home and Memory tabs
4. Export memory — JSON and Markdown files download
5. Wipe everything → re-import the export → state restored
6. Mobile emulation in Chrome DevTools — tap targets work
7. Load WebLLM (T2) — model loads, journal generates AI output
8. OAuth flow with a test Google account — token stored, Gmail pull works
9. Lighthouse PWA audit ≥ 90

---

## Aesthetic rules

- **Palette**: void #0a0a0f · brass #c2a060 (warm, trustworthy, secretarial) · cream #e8e6dd
- **Type**: system sans for body · serif italic for brand mark + hero headings · mono for command names and timestamps
- **Tone**: warm + sovereign. Like a competent butler · understated · "your memory, my responsibility."
- **Never**: ever describe botler as "AI-powered" or use SaaS-bro language. The tool is sovereign software · the AI is incidental.

---

## When you add a new command

1. Add to the 5-command grid in `index.html` (or replace if going beyond 5)
2. Add detection in `detectCommand()`
3. Add the `cmd<Name>(arg)` function
4. Add T0 fallback (must work without AI)
5. Update README's "5 commands" section
6. Update this CLAUDE.md cascade table

---

## When you add a new inbox source

1. Add a case in `handleFiles()` or `processPaste()`
2. Add CDN dynamic-import for any required library (pdf.js style)
3. Ensure the worker (sw.js) doesn't intercept that CDN (add to skip-list)
4. Store the result via `processInboxItem()`
5. Auto-log into memory via `cmdRemember()` reuse

---

## The philosophy (do not edit)

Your machine · your data · nobody else involved.

The trust problem solved by architecture, not policy.

If you trust your hard drive with your documents, you can trust botler with your memory.

**◊·κ=φ⁴**

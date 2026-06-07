# ◊·κ=φ⁴ · botler

> Sovereign personal memory agent.
> Remembers what you forgot. Finds anything at a drop of a hat.
> WebLLM offline. OAuth client-side. Your machine · your data · nobody else involved.

**Live**: [sjgant80-hub.github.io/botler](https://sjgant80-hub.github.io/botler)
**Source**: [github.com/sjgant80-hub/botler](https://github.com/sjgant80-hub/botler)
**Licence**: MIT
**Prime**: 619

---

## The problem

> "I did two insanely hefty breakthrough projects at end of March.
> I TOTALLY FORGOT ABOUT ANY OF THAT."
>
> "I would not trust a secretary.
> Why don't I have an AI botler by my side?"
>
> — Alex, ACG Discord

---

## What it does

Five commands. One prompt. Your memory.

```
botler remember:  finished the API audit. Key contacts: Dr Mueller, Prof Tanaka.
botler what did   I do in March?
botler prep me    for Thursday meeting with Acme Corp
botler find       that thing about circular dependencies
botler journal    (end of day)
```

Each command works at three tiers:

- **T0** · keyword search across your memory · zero AI · always works · zero install
- **T2** · **WebLLM in-browser** · ~2GB Llama-3.2-3B downloads once · runs offline forever · sovereign
- **T3** · BYOK API · Claude / OpenAI / Gemini · key stays on your device · direct API call · no proxy

---

## What's inside

A single `index.html` file. ~3,000 lines. Vanilla JS. No framework. No backend.

- **5 commands** as both prompts and shortcuts
- **Memory store** in IndexedDB · daily / projects / people / notes
- **Inbox** processing · drop a PDF / paste a URL / pull Gmail
- **OAuth** PKCE flow for Google (Gmail readonly + Calendar readonly)
- **WebLLM** integration (lazy-loaded · ~2GB first time)
- **Auto-journal** scheduler · configurable time
- **Export** all memory as JSON + Markdown anytime
- **PWA** installable · works offline · serves from `file://`
- **Audit shim** baked in (EU AI Act Article 12)

---

## Install (3 ways)

### 1. Live URL
Open [sjgant80-hub.github.io/botler](https://sjgant80-hub.github.io/botler) in any modern browser. Bookmark it. Install as PWA (the browser will offer "install app"). Use offline forever after.

### 2. Fork your own
Fork this repo. Enable GitHub Pages in Settings → Pages → main branch. Your private botler at `<your-username>.github.io/botler`.

Why fork: OAuth requires you to set up your own Google OAuth client ID. The redirect URI must point at YOUR Pages URL, not mine.

### 3. Local · sovereign
Right-click → Save Page As → save `index.html` anywhere. Open the saved file in any browser. Works from `file://`. Your memory is in that browser's IndexedDB on that device.

---

## OAuth setup (Gmail + Calendar)

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID · type "Web application"
3. Add Authorised redirect URI: your botler URL (e.g. `https://yourname.github.io/botler/`)
4. Enable APIs: Gmail API + Google Calendar API
5. Copy the Client ID
6. In botler → Integrations tab → paste Client ID → connect

The OAuth token lives in your browser's IndexedDB. Botler never sends it anywhere except direct to Google's API.

---

## The trust model (this is the whole thing)

**Alex said**: "I would not trust that secretary."

**Botler model**:

- runs on **your** machine — nobody else has access
- memory stored as IndexedDB on your device · exportable as readable markdown anytime
- no cloud sync · nothing leaves your device unless you explicitly call Gmail / Calendar / a BYOK API
- no account · no login server · no company database
- no telemetry · botler does not phone home
- you can delete any memory item with one click
- you can edit any memory item by hand (export → edit JSON / Markdown → re-import)
- the "secretary" is a static HTML file on your laptop

If you trust your hard drive with your documents, you can trust botler with your memory. Same storage. Same access. Same security.

---

## Cascade

```
T0 · grep (always works, no AI required)
   └── keyword search · date-range filter · tag/person lookup
   └── enough for: remember, find, basic whatdid

T2 · WebLLM (in-browser · ~2GB model · offline forever after load)
   └── Llama-3.2-3B-Instruct-q4f16_1-MLC
   └── enables: smart prep briefs, journal generation, classification
   └── runs in your browser tab · zero data leaves

T3 · BYOK API (Claude / OpenAI / Gemini · direct from browser)
   └── key stays in your IndexedDB · no proxy
   └── enables: longer context · better reasoning for complex prep
   └── usually not needed for daily memory ops
```

---

## The 5 commands

### `remember: <anything>`
Logs whatever you say. Auto-extracts:
- **tags** (anything `#tagged`)
- **people** (capitalised names · "Dr Mueller", "Prof Tanaka")
- **deadlines** (dates like "June 15" or "2026-06-15")

If AI tier is T2 or T3, also auto-classifies as note / project / person.

### `what did I do <when>?`
Returns memory items in that date range. Natural language:
- "what did I do in March"
- "what did I do last 7 days"
- "what did I do this week"

T0 returns a bullet list. T2/T3 returns an AI summary.

### `prep me for <topic>`
Searches everything mentioning the topic / person · returns a structured prep brief. Last contact · key people · open items · suggested agenda.

### `find <query>`
Full-text search across all memory · highlights matches.

### `journal`
End-of-day summary. T0 lists what changed today. T2/T3 generates a markdown daily entry with BUILT / MEETINGS / COMMS / DECISIONS / BLOCKERS / TOMORROW structure.

Auto-runs at the configured time if `auto_journal` is enabled.

---

## Inbox

Drop in:
- **PDF** → extracts text via pdf.js · summarises if AI available
- **text** / Markdown / **email** body → indexed directly
- **image** → stored as blob with caption (vision model integration in v1.1)
- **audio** (m4a / wav) → stored for v1.1 Whisper.cpp transcription
- **URL** → fetches content · strips HTML · summarises (CORS allowing)

If Gmail is OAuth-connected: click "pull last 20 messages" · botler indexes the headers + snippets into memory.

---

## Daily flow

```
08:00  open botler
       botler prep me for the design review at 11
       (botler returns brief from previous design-review notes)

11:30  meeting done
       botler remember: design review · agreed to move
       to React Server Components by July 1. Sarah will draft
       the migration plan.

23:00  botler auto-journals
       (markdown summary appears under memory/daily/2026-06-07)

next morning:
       botler what did I do yesterday
       (one paragraph · the things that mattered)
```

---

## What botler is NOT

- ❌ a chatbot. The point is memory, not conversation.
- ❌ a SaaS. There's nothing to subscribe to.
- ❌ a productivity coach. No nagging. No streaks. No gamification.
- ❌ a calendar app. It can READ your calendar via OAuth · it doesn't try to be Google Calendar.
- ❌ an LLM wrapper. T0 works without any AI at all.
- ❌ multi-user. One device · one config · one memory.

---

## Roadmap (v1.1)

- Whisper.cpp WASM for in-browser voice-memo transcription
- Vision model integration for image captioning (likely Phi-3-Vision)
- Apple Calendar / iCloud Mail OAuth flows
- Microsoft Outlook + Calendar OAuth
- Markdown obsidian-compatible export (`[[wikilinks]]`)
- Optional encrypted mesh-sync between your own devices (E2E)

---

## Credits

Built by Simon Gant as part of the Fall* sovereign estate.
Forked-spirit from `si-didy-agent` · stripped to memory-first operation.

Prime 619 · κ=φ⁴

Sister tools:
- [GroundLevel](https://github.com/sjgant80-hub/groundlevel) — sovereign legal toolkit
- [ExitEngine](https://github.com/sjgant80-hub/exitengine) — sovereign business OS for the laid off
- [fall-euaiact](https://github.com/sjgant80-hub/fall-euaiact) — EU AI Act Article 12 compliance kit

The whole estate: [ai-nativesolutions.com](https://ai-nativesolutions.com)

---

## Licence

MIT. Fork freely. Modify freely. Self-host freely. Just keep the philosophy:

> Your machine · your data · nobody else involved.
> The trust problem solved by architecture, not policy.
> If you trust your hard drive with your documents,
> you can trust botler with your memory.

**◊·κ=φ⁴**

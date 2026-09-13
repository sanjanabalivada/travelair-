# TravelBud — Autonomous Quality Engineering for the AI Development Era

A small travel booking flow with a self-healing Playwright test suite,
fail-closed AI healing, and a TruthGuard layer that refuses to fabricate
a live flight status when its data source is unavailable.

## What this demonstrates (mapped to the problem statement)

| Problem statement pain point | What this project does about it |
|---|---|
| Static locators break on UI change even when functionality is correct | Self-heal loop: on a locator miss, an LLM proposes a semantic replacement, which is independently re-validated (unique/visible/enabled) before ever being clicked |
| Reduced confidence in regression results | The dashboard reports PASS / CONDITIONAL / BLOCK / UNVERIFIED, not just green/red — a healed test is CONDITIONAL, not a silent PASS |
| Risk of production defects escaping detection | Every healing decision is logged with its confidence score and validation result — nothing is accepted on the model's word alone |
| AI-accelerated delivery outpacing QA | The system is designed to keep running (deterministically) even when the AI layer is unavailable — see Fail-Safe Mode below |

Compliance framing: mapped to **ISO/IEC 25010** quality characteristics
(functional suitability, reliability, security) and reported in the
style of **ISO/IEC/IEEE 29119** test-execution records — see the
dashboard. No certification is claimed; this is "control-aligned," not
"ISO certified."

## Setup

```bash
npm install
npx playwright install chromium   # downloads the browser binary — needs real internet access
```

Optional, for AI-assisted self-healing:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```
**If you skip this, the app still works.** Self-healing will report
`heal_skipped` / `fallback-deterministic` and the affected test will
fail honestly instead of reporting a false pass. This is the required
fail-closed behavior, not a bug — see Fail-Safe Mode below.

## Running it

```bash
npm run demo
```
This runs the Playwright suite, then builds `dashboard/data.json`.
Then open `dashboard/dashboard.html` directly in a browser (or serve
the repo root with any static server) to see the Journey Confidence
score, release gate, and healing evidence log.

To view the live app on its own: `npm run dev` → http://localhost:4173

## The demo script (rehearse this exact sequence)

1. **Baseline** — with both toggles off, run `npm run demo`. All 4
   tests pass, Journey Confidence 100, gate PASS.
2. **Break it live** — open the app, check "Simulate UI regression"
   (renames "Confirm Booking" to "Complete Reservation"). Re-run
   `npm run demo` with `ANTHROPIC_API_KEY` set. The old selector
   misses, the self-heal layer proposes and validates a replacement,
   the test still passes, and the dashboard shows gate **CONDITIONAL**
   with the healing event logged — say out loud: *"a healed test isn't
   the same as an untouched pass, and the dashboard says so."*
3. **Turn off the key** — `unset ANTHROPIC_API_KEY`, re-run with the
   same UI regression still active. The test now fails *honestly*, the
   dashboard shows the `UNAVAILABLE` banner. Say: *"no key, no
   guessing — it tells you the truth about what it can't verify."*
4. **Chaos: kill the flight-status source** — check "Simulate
   flight-status outage" and open `disruption.html`. Show the
   UNVERIFIED banner and that no fabricated rebooking options appear.
   Uncheck it, reload, show the real CANCELLED status and rebooking
   options. This is TruthGuard and your chaos-testing checkbox in one
   scene.
5. **Close** with the K8s manifest (`k8s/deployment.yaml`): *"this
   demo runs locally, but it's built to the same container/health-check/
   autoscaling shape Amadeus already runs on."*

## Judge Q&A prep

- **"Why not just use a normal healing library?"** Because the hard
  part isn't proposing a fix, it's not trusting the fix — the
  validation gate (unique/visible/enabled) is what makes this safe to
  ship, and it's fully deterministic code, not another model call.
- **"What if the LLM is confidently wrong?"** Confidence alone never
  accepts a repair — see `CONFIDENCE_THRESHOLD` in `healer/selfHeal.js`
  plus the independent DOM validation. A wrong-but-confident proposal
  still gets rejected if it doesn't resolve to a unique, visible,
  enabled control.
- **"How does this scale?"** `k8s/deployment.yaml` — containerized,
  health-checked, horizontally autoscaled on CPU; the healing log and
  metrics are designed to ship to Prometheus/Loki in the same shape
  they're logged here.
- **"Isn't ISO 25010/29119 a stretch?"** No — 25010's characteristics
  (functional suitability, reliability, security, performance
  efficiency, usability/accessibility) map directly onto the scope line
  in the problem statement (UI, API, security, accessibility,
  performance); 29119 is literally the international standard for
  software testing process and documentation.

## Project structure

```
src/          the travel app under test — React + Vite + React Router
tests/        Playwright suite, including the self-heal scenario
healer/       LLM client (fail-closed) + validation-gated self-heal orchestrator
scripts/      builds dashboard/data.json from the Playwright + healing logs
dashboard/    the Journey Confidence / release-gate evidence report
k8s/          deployment manifest (design evidence, not a live dependency)
vite.config.js   dev server config — runs on port 4173 to match Playwright's baseURL
frontend/     retired vanilla HTML/CSS/JS version, kept for reference only
```

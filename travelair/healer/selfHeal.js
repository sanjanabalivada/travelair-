const fs = require('fs');
const path = require('path');
const { isAvailable, proposeSelectorRepair } = require('./llmClient');

const LOG_PATH = path.join(__dirname, '..', 'results', 'healing-log.json');

function appendLog(event) {
  let log = [];
  try { log = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')); } catch (e) { /* first run */ }
  log.push({ ...event, timestamp: new Date().toISOString() });
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Attempt to recover from a failed locator by asking the LLM for a
 * semantic replacement, then independently validating the candidate
 * against the live page before ever clicking it.
 *
 * Returns the Playwright locator to use if healing succeeded, or
 * throws the original error if it did not (or if AI healing is
 * unavailable) — this function never invents a false pass.
 */
async function attemptSelfHeal(page, { intendedAction, previousSelectorDescription, originalError }) {
  if (!isAvailable()) {
    appendLog({
      event: 'heal_skipped',
      mode: 'fallback-deterministic',
      intendedAction,
      previousSelectorDescription,
      reason: 'ANTHROPIC_API_KEY not configured — reporting real failure instead of guessing',
    });
    throw originalError;
  }

  const domSnippet = await page.locator('main, .card, body').first().innerHTML().catch(() => '');
  const proposal = await proposeSelectorRepair({
    intendedAction,
    previousSelectorDescription,
    domSnippet: domSnippet.slice(0, 4000),
  });

  if (!proposal.available) {
    appendLog({
      event: 'heal_skipped',
      mode: 'llm-unavailable',
      intendedAction,
      previousSelectorDescription,
      reason: proposal.reason,
    });
    throw originalError;
  }

  if (!proposal.role || !proposal.name || proposal.confidence < CONFIDENCE_THRESHOLD) {
    appendLog({
      event: 'heal_rejected',
      mode: 'low-confidence-or-no-candidate',
      intendedAction,
      previousSelectorDescription,
      proposal,
    });
    throw originalError;
  }

  // Independent validation — never trust the LLM's claim on its own.
  const candidate = page.getByRole(proposal.role, { name: proposal.name });
  const count = await candidate.count();
  const validation = { unique: count === 1, visible: false, enabled: false };

  if (validation.unique) {
    validation.visible = await candidate.first().isVisible().catch(() => false);
    validation.enabled = await candidate.first().isEnabled().catch(() => false);
  }

  const accepted = validation.unique && validation.visible && validation.enabled;

  appendLog({
    event: accepted ? 'heal_accepted' : 'heal_rejected',
    mode: 'ai-assisted',
    intendedAction,
    previousSelectorDescription,
    proposal,
    validation,
  });

  if (!accepted) throw originalError;

  return candidate;
}

module.exports = { attemptSelfHeal };

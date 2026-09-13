// LLM abstraction for the self-healing layer.
//
// Contract with the rest of the system ("LLM = language and reasoning,
// code = truth and control"): this module only ever *proposes* a
// candidate selector plus a confidence score. It never decides whether
// the repair is accepted — selfHeal.js independently validates every
// candidate against the live DOM before anything is clicked.
//
// If no API key is configured, `available` is false and the caller
// MUST fall back to deterministic behaviour (report the real failure)
// rather than guessing. This is the fail-closed contract the whole
// project is built around.

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.TRAVELGUARD_MODEL || 'claude-sonnet-4-6';

function isAvailable() {
  return Boolean(API_KEY);
}

/**
 * Ask the model for a semantic replacement locator for a control whose
 * previous selector no longer matches anything on the page.
 *
 * @param {object} params
 * @param {string} params.intendedAction - plain-language description of what the control does
 * @param {string} params.previousSelectorDescription - the selector that stopped matching
 * @param {string} params.domSnippet - relevant HTML around where the control used to be
 * @returns {Promise<{available: boolean, role?: string, name?: string, confidence?: number, reasoning?: string}>}
 */
async function proposeSelectorRepair({ intendedAction, previousSelectorDescription, domSnippet }) {
  if (!isAvailable()) {
    return { available: false, reason: 'ANTHROPIC_API_KEY not configured' };
  }

  const systemPrompt = `You repair broken UI test selectors for a QA automation system.
You will be given: the intended user action, the selector that used to work, and the
current DOM around where the control used to be.

Respond with ONLY a JSON object, no prose, no markdown fences, in this exact shape:
{"role": "<ARIA role, e.g. button>", "name": "<accessible name/text of the best candidate control>", "confidence": <number 0-1>, "reasoning": "<one sentence>"}

If no plausible candidate exists in the DOM snippet, respond with:
{"role": null, "name": null, "confidence": 0, "reasoning": "<why not>"}

Never invent a control that isn't present in the DOM snippet.`;

  const userPrompt = `Intended action: ${intendedAction}
Previous selector (no longer matches): ${previousSelectorDescription}
Current DOM snippet:
${domSnippet}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        ...(process.env.ANTHROPIC_WORKSPACE_ID
          ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
          : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      return { available: false, reason: `LLM API error: ${res.status}` };
    }

    const data = await res.json();
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    const cleaned = text.replace(/^```json\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.role || !parsed.name) {
      return { available: true, role: null, name: null, confidence: 0, reasoning: parsed.reasoning };
    }
    return { available: true, ...parsed };
  } catch (err) {
    // Network/parse failure -> treat as unavailable, never as "healed".
    return { available: false, reason: `LLM call failed: ${err.message}` };
  }
}

module.exports = { isAvailable, proposeSelectorRepair };

// Deterministic risk engine. No LLM involvement anywhere in this file —
// risk scoring is exactly the kind of decision that must stay auditable
// and reproducible, which is why it's plain arithmetic, not a model call.
//
// riskScore = businessCriticality*0.30 + customerImpact*0.25
//           + failureFrequency*0.20   + dataSensitivity*0.15
//           + recentChange*0.10
// All factors normalized 0-1. Higher score = higher priority to protect.

const JOURNEY_PROFILE = {
  'completes a booking end to end (baseline, no application drift)': {
    journey: 'Payment / Booking',
    businessCriticality: 1.0,
    customerImpact: 1.0,
    dataSensitivity: 0.8, // payment details
  },
  'self-heals when the confirm control is renamed under the test (UI drift)': {
    journey: 'Payment / Booking (under UI drift)',
    businessCriticality: 1.0,
    customerImpact: 1.0,
    dataSensitivity: 0.8,
  },
  'reports UNVERIFIED instead of a fabricated status when the flight-status API is down': {
    journey: 'Disruption / Rebooking',
    businessCriticality: 0.9,
    customerImpact: 0.9,
    dataSensitivity: 0.3,
  },
  'shows a real disruption and rebooking options when the status API is healthy': {
    journey: 'Disruption / Rebooking',
    businessCriticality: 0.9,
    customerImpact: 0.9,
    dataSensitivity: 0.3,
  },
};

function priorityLabel(score) {
  if (score >= 0.85) return 'P0';
  if (score >= 0.65) return 'P1';
  if (score >= 0.40) return 'P2';
  return 'P3';
}

/**
 * @param {Array<{title:string, status:string}>} testDetail - from build-report.js
 * @param {Array<object>} healingEvents - from healing-log.json
 */
function computeRisk(testDetail, healingEvents) {
  return testDetail.map(t => {
    const profile = JOURNEY_PROFILE[t.title] || {
      journey: t.title, businessCriticality: 0.5, customerImpact: 0.5, dataSensitivity: 0.3,
    };

    // failureFrequency: did this run actually fail or need healing? (observed, not historical —
    // labeled as such; a real deployment would track this across runs over time)
    const failed = t.status !== 'passed';
    const healedThisRun = healingEvents.some(e =>
      e.event === 'heal_accepted' || e.event === 'heal_rejected');
    const failureFrequency = failed ? 1.0 : (healedThisRun ? 0.5 : 0.0);

    // recentChange: BREAK_MODE / chaos toggles are exactly "a change was just introduced"
    const recentChange = healedThisRun || failed ? 1.0 : 0.0;

    const score =
      profile.businessCriticality * 0.30 +
      profile.customerImpact * 0.25 +
      failureFrequency * 0.20 +
      profile.dataSensitivity * 0.15 +
      recentChange * 0.10;

    return {
      journey: profile.journey,
      testTitle: t.title,
      status: t.status,
      riskScore: Math.round(score * 100) / 100,
      priority: priorityLabel(score),
      factors: {
        businessCriticality: profile.businessCriticality,
        customerImpact: profile.customerImpact,
        failureFrequency,
        dataSensitivity: profile.dataSensitivity,
        recentChange,
      },
    };
  }).sort((a, b) => b.riskScore - a.riskScore);
}

module.exports = { computeRisk, priorityLabel };

// Reads Playwright's JSON report + the self-healing log and produces
// dashboard/data.json: the Journey Confidence score, release gate,
// AI-healing mode, and a per-test breakdown for the dashboard UI.
const fs = require('fs');
const path = require('path');
const { computeRisk } = require('./risk-engine');

const RESULTS_PATH = path.join(__dirname, '..', 'results', 'results.json');
const HEALING_LOG_PATH = path.join(__dirname, '..', 'results', 'healing-log.json');
const OUT_PATH = path.join(__dirname, '..', 'dashboard', 'data.json');

// This demo never talks to a real travel API (no Amadeus credentials are
// configured anywhere in this project) — labeled explicitly rather than
// left ambiguous, per the same fail-closed philosophy as aiMode below.
const DATA_MODE = 'MOCK — no live travel API configured; FLIGHTS/ALTERNATIVES in frontend/app.js are static demo data';

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return fallback; }
}

function collectTests(suites, acc = []) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const result = (t.results || [])[0] || {};
        acc.push({ title: spec.title, status: result.status || 'unknown' });
      }
    }
    collectTests(suite.suites, acc);
  }
  return acc;
}

const report = readJson(RESULTS_PATH, { suites: [] });
const healingLog = readJson(HEALING_LOG_PATH, []);

const tests = collectTests(report.suites);
const passed = tests.filter(t => t.status === 'passed').length;
const failed = tests.filter(t => t.status !== 'passed').length;

const accepted = healingLog.filter(e => e.event === 'heal_accepted').length;
const rejected = healingLog.filter(e => e.event === 'heal_rejected').length;
const skipped = healingLog.filter(e => e.event === 'heal_skipped').length;

let aiMode = 'NOT EXERCISED';
if (healingLog.some(e => e.event === 'heal_accepted')) aiMode = 'ACTIVE';
else if (healingLog.some(e => e.mode === 'fallback-deterministic')) aiMode = 'UNAVAILABLE — ANTHROPIC_API_KEY not configured';
else if (healingLog.some(e => e.mode === 'llm-unavailable')) aiMode = 'DEGRADED — LLM call failed';
else if (rejected > 0) aiMode = 'ACTIVE (last proposal rejected by validation gate)';

let journeyConfidence = 100 - failed * 15 - accepted * 5;
journeyConfidence = Math.max(0, Math.min(100, journeyConfidence));

let releaseGate = 'PASS';
if (failed > 0) releaseGate = 'BLOCK';
else if (accepted > 0) releaseGate = 'CONDITIONAL';
if (tests.length === 0) releaseGate = 'UNVERIFIED';

const riskTable = computeRisk(tests, healingLog);

const data = {
  generatedAt: new Date().toISOString(),
  journeyConfidence,
  releaseGate,
  aiMode,
  dataMode: DATA_MODE,
  tests: { total: tests.length, passed, failed },
  healing: { accepted, rejected, skipped, events: healingLog },
  testDetail: tests,
  risk: riskTable,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
console.log('Dashboard data written to', OUT_PATH);
console.log(JSON.stringify({ journeyConfidence, releaseGate, aiMode, tests: data.tests }, null, 2));

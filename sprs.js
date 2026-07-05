/**
 * NIST SP 800-171 SPRS score engine — official DoD Assessment Methodology (v1.2.1) as code.
 * Data: controls.psv (id|title|weight|level1), weights: 5, 3, 1.
 * Special markers: S = MFA 3.5.3 (5pt, partial credit -3), F = FIPS 3.13.11 (5pt, partial -3),
 * R = SSP 3.12.4 (5pt, REQUIRED — without an SSP no assessment can be conducted).
 * By ITSecOps (itsecops.cloud) — live calculator: https://itsecops.cloud/sprs-score-calculator/
 * MIT licensed. Not affiliated with or endorsed by the US DoD.
 */

function parseControls(psv) {
    return psv.trim().split(/\r?\n/).map(function (line) {
          var p = line.split('|');
          var w = p[2];
          return {
                  id: p[0],
                  title: p[1],
                  weight: (w === 'S' || w === 'F' || w === 'R') ? 5 : parseInt(w, 10),
                  special: w === 'S' ? 'MFA' : w === 'F' ? 'FIPS' : w === 'R' ? 'SSP' : null,
                  level1: p[3] === '1'
          };
    });
}

/**
 * statuses: map of control id -> 'met' | 'partial' | 'not-met' | 'na'
 * ('partial' only earns credit on MFA 3.5.3 and FIPS 3.13.11: deducts 3 instead of 5.
 *  Everything else is all-or-nothing per the methodology. 'na' requires a documented
 *  N/A justification the assessor accepts — use sparingly.)
 * Returns { score, max, deductions, sspMissing }
 */
function sprsScore(controls, statuses) {
    var score = 110, deductions = [], sspMissing = false;
    controls.forEach(function (c) {
          var s = statuses[c.id] || 'not-met';
          if (s === 'met' || s === 'na') return;
          if (c.special === 'SSP') { sspMissing = true; }
          var d = c.weight;
          if (s === 'partial' && (c.special === 'MFA' || c.special === 'FIPS')) d = 3;
          score -= d;
          deductions.push({ id: c.id, points: d });
    });
    return { score: score, max: 110, deductions: deductions, sspMissing: sspMissing };
}

/* Conditional CMMC Level 2 status requires >= 88 (80%) with a POA&M closed in 180 days;
   most 5-point requirements cannot be POA&M'd. 110 is required for final status. */
function conditionalEligible(result) {
    return !result.sspMissing && result.score >= 88;
}

if (typeof module !== 'undefined') {
    module.exports = { parseControls: parseControls, sprsScore: sprsScore, conditionalEligible: conditionalEligible };
}

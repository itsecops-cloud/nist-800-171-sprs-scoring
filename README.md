# NIST SP 800-171 SPRS Scoring — the DoD Assessment Methodology as code

All **110 NIST SP 800-171 Rev. 2 security requirements** with their official DoD Assessment Methodology (v1.2.1) point weights, plus a dependency-free scoring engine implementing the exact SPRS rules — including the special cases most spreadsheets get wrong.

Maintained by [ITSecOps](https://itsecops.cloud) — this dataset powers our free, no-signup [SPRS Score Calculator](https://itsecops.cloud/sprs-score-calculator/).

## Why this exists

Every defense contractor handling CUI must self-assess against NIST SP 800-171 and report a score (-203 to +110) to the DoD Supplier Performance Risk System (SPRS). The methodology has non-obvious rules that are frequently implemented incorrectly:

- Scoring starts at **110** and each unimplemented requirement subtracts **5, 3 or 1** points — partial implementation earns **no credit**…
- - …except **MFA (3.5.3)** and **FIPS-validated cryptography (3.13.11)**, which have defined partial deductions of **3** instead of 5
  - - **The SSP (3.12.4) is a gate**: without a System Security Plan, no assessment can be conducted at all
    - - Under the CMMC Program rule (32 CFR 170), a Level 2 score of **>= 88 (80%)** can qualify for *Conditional* certification status with a POA&M closed within 180 days — but most 5-point requirements cannot be on a POA&M, and **110 is required for final status**
     
      - ## Files
     
      - | File | What it is |
      - |---|---|
      - | `controls.psv` | 110 controls, one per line: `id\|title\|weight\|level1`. Weight is `5`, `3`, `1`, or a special marker: `S` = MFA 3.5.3, `F` = FIPS 3.13.11 (both 5pt with partial credit -3), `R` = SSP 3.12.4 (5pt, required). `level1` = 1 if the control maps to CMMC Level 1 / FAR 52.204-21 basic safeguarding. |
      - | `sprs.js` | Parser + scoring engine + CMMC L2 conditional-eligibility check. Zero dependencies, Node and browser. |
     
      - ## Usage
     
      - ```js
        const fs = require('fs');
        const { parseControls, sprsScore, conditionalEligible } = require('./sprs');

        const controls = parseControls(fs.readFileSync('controls.psv', 'utf8'));
        const result = sprsScore(controls, {
          '3.1.1': 'met',
          '3.5.3': 'partial',   // MFA partially deployed: -3 instead of -5
          '3.12.4': 'met',      // SSP exists (mandatory)
          // any control omitted counts as 'not-met'
        });
        console.log(result.score, conditionalEligible(result));
        ```

        ## Weight distribution

        - 42 requirements x 5 points (including MFA and FIPS with their partial rules, and the SSP gate)
        - - 14 requirements x 3 points
          - - 51 requirements x 1 point
            - - Minimum possible score: **-203**, maximum: **110**
             
              - ## Sources
             
              - - DoD *NIST SP 800-171 Assessment Methodology*, version 1.2.1
                - - [32 CFR Part 170 — CMMC Program final rule](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program)
                  - - NIST SP 800-171 Rev. 2
                   
                    - ## Related free resources
                   
                    - - [Interactive SPRS Score Calculator](https://itsecops.cloud/sprs-score-calculator/) — this dataset with a UI: per-control evidence states, family plaques, shareable scorecard
                      - - [CMMC Cost & Roadmap Planner](https://itsecops.cloud/cmmc-cost-roadmap-planner/) — turns your gaps into a dated, costed plan
                        - - [CMMC Cost Index 2026](https://itsecops.cloud/cmmc-cost-index/) — benchmarked costs for 8 contractor profiles
                          - - [CMMC for contractors outside the US](https://itsecops.cloud/compliance/cmmc-international/)
                           
                            - ## Disclaimer
                           
                            - Titles are abbreviated for readability — the authoritative text is NIST SP 800-171. Your reportable SPRS score must come from a documented self-assessment against your SSP. Not affiliated with or endorsed by the US Department of Defense or NIST. MIT licensed — use it, fork it, build on it.
                            - 

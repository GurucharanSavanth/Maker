# Airtel × Jio — From Promise to Experience
## https://gurucharansavanth.github.io/Maker/

An academic services-marketing report with 15 directly accessible chapters, seven Studio views and two evidence pages. Built with Next.js/React/TypeScript, Motion and modular ECharts. All delivered pages are static exports; no runtime database or API is required.

The **Living Signal** direction connects operator promises to delivery, perceptions and recovery. The opening signal map, traceable 7Ps circuit and journey playback share a pause control and respect reduced motion. Studio shows one dot per source record; filters dim excluded respondents and update persistent chart instances. Survey state and report selections are preserved in the URL.

## Run

Requires Node.js 24 and npm. From this directory:

```powershell
npm ci
npm run build
npm start
```

Open `http://127.0.0.1:4173`. For editing, `npm run dev` starts the Next development server. Webpack is selected explicitly because it bundles the TypeScript statistical Web Worker correctly. The production output is `out/`.

## Reproduce the data

The project owner explicitly requested publication of the unchanged workbook. It is stored at `data/survey.xlsx` and Studio fetches it from [GitHub Raw](https://raw.githubusercontent.com/GurucharanSavanth/Airtel-VS-JIO/main/data/survey.xlsx). The SHA-256 must match `public/data/manifest.json` before it is parsed. Analytical records exclude contact fields; the downloadable source workbook is unchanged. Text answers, themes and retained phrases are derived from this verified workbook in the browser. Report snapshots and aggregate NLP diagnostics remain precomputed. No separate response-text corpus is published. Use Python 3.12 or later:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/prepare_data.py --input "..\Airtel vs Jio – Customer Service & Experience Survey(1-946).xlsx"
npm test
npm run build
```

Preparation validates the questionnaire, creates anonymous row-order keys, normalizes categories, computes independent SciPy reference fixtures and regenerates the report snapshot. Source/script hashes and dependency versions are recorded in the data manifests. No missing survey variables or observations are synthesized.

The fixed text-review annotations and theme dictionary live beside the preparation scripts. A changed corpus deliberately fails review-sample checks rather than reusing validation on different answers. Refresh the frozen review through a documented review process before publishing a changed dataset.

## Analytical conventions

- Base n=946 (433 Airtel, 513 Jio). Support questions N–R use support=Yes (599). Failure/recovery U–Z use failure=Yes (520).
- Question-specific eligibility combines with URL-backed filters. Within multi-select filters OR applies; across filters AND applies. A respondent is never expanded into independent service rows.
- Primary rating summaries preserve the 1–5 distribution. Means, median, all modes, sample variance and SD remain available.
- Provider inference uses two-sided tie/continuity-corrected Mann–Whitney U, Cliff’s delta, five-proxy Holm adjustment and 2,000 deterministic respondent bootstraps.
- Spearman uses pairwise eligibility and 4,999 deterministic permutations. Pearson chi-square is uncorrected and requires every expected cell ≥5 and each provider n≥20.
- Missing/unavailable results are null. A nonsignificant test is not an equivalence result. No national representativeness or causal inference is claimed.
- SERVQUAL dimensions are question proxies. No paired expectations, physical-tangibles scale, validated composite score or NPS is fabricated.
- Customer-response origin and 1-low/5-high coding were confirmed by the project owner. Recruitment, field dates and sampling design were not supplied.

## NLP limitation

The corpus contains 520 incident descriptions, 946 best-aspect answers and 946 improvement answers. The 426 incident placeholders are excluded. Phrase and theme inspection is available, including repeated-text sensitivity within provider and question.

Automated sentiment is withheld: the fixed 120-response model-assisted semantic review measured three-class macro-F1 **0.437**, below **0.75** (observed-class macro-F1 **0.656**, accuracy **65%**). It is not human annotation or an independent gold standard. Aspect sentiment shares the failed gate. The theme dictionary reports explicit mentions, not inferred causes, and its review is in-sample.

## Validation

```powershell
npm test
npm run check
npx playwright install chromium
# Start npm start in a separate terminal, then:
npm run qa
node scripts/interaction-check.mjs
node scripts/performance.mjs
```

`tests/analytics.test.ts` checks independent reference results across seven segments and edge cases. Browser QA visits every route, audits accessibility, tests responsive viewports and major interactions, and writes local results to `test-results/` (not published or tracked). The performance script evaluates representative routes and records transfer budgets.

## Content and hosting

`src/data/report.json` contains the reconstructed frameworks, blueprints and recommendations. `src/lib/catalog.ts` owns question definitions, route labels and dated external evidence. `src/data/snapshot.json` is generated from the workbook and is never edited manually.

External evidence is frozen as checked on 9 September 2026. Revisions must retain original claims and document replacements. The Jio AirFiber/national FWA cross-source comparison is intentionally withheld pending denominator reconciliation.

The static output is hosted through Sites. No application-owned authentication is implemented. Hosting access governs the preview audience; generated pages use noindex metadata. Raw workbooks, analysis fixtures and Python source are not in the static output.

The Windows Sites build wrapper could not resolve its npm launcher in the bundled runtime. The documented `npm run build` command builds the same configured Next.js static output successfully. The Sites packaging helper is used for delivery.

See [VALIDATION.md](VALIDATION.md) for measured results, test conditions and benchmark exceptions.

## GitHub Pages

The `.github/workflows/pages.yml` workflow tests and builds the static site on pushes to `main`, then publishes it to https://gurucharansavanth.github.io/Airtel-VS-JIO/. Set Pages to GitHub Actions in repository settings if automatic enablement is unavailable.

Production uses `NEXT_PUBLIC_BASE_PATH=/Airtel-VS-JIO`. Local root-path builds leave it unset. Internal links, static data and JavaScript assets all respect this prefix. Studio downloads the raw XLSX on entry (30-second timeout), verifies its SHA-256, and parses it with lazy-loaded SheetJS 0.20.3. Failed downloads or mismatched workbooks show an error with retry, rather than silently using a different dataset.

To replace the workbook, regenerate the audited data, text annotations and report snapshot using the existing pipeline before committing the new file and manifest together. The original source is publicly downloadable as explicitly authorized by the project owner.

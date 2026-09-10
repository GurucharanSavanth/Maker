# Production validation · 10 September 2026

The supplied workbook was rebuilt without changing the raw input. Six analytical checks pass, including reconciliation against independent SciPy fixtures across seven segments. Base n=946 (433 Airtel / 513 Jio); support eligibility n=599; failure eligibility n=520. The fixed text-review gate remains failed (macro-F1 0.437), so aggregate and aspect sentiment are withheld.

## Browser and interaction checks

- All 24 Report, Studio and Evidence routes returned 200 and opened directly.
- Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA rules reported zero violations on all 24 default route states.
- 36 responsive route/viewport combinations at 360, 390, 768, 1024, 1440 and 1920 CSS pixels showed no page overflow.
- 28 additional interaction checks covered every filter value, OR within multi-selects, AND across filters, browser history, rapid question changes, stable chart instances, actual signal movement, playback and global pause.
- Keyboard stage selection and reduced motion were exercised. 200% reflow was modeled as 720 CSS pixels at device scale 2 for a 1440px physical viewport; this does not claim certification across every browser zoom implementation.
- Chart counts have equivalent tables; SERVQUAL includes all five response levels. Text excerpts are paginated. Diagram labels distinguish analytical models from measured frequencies.
- The completed cross-application run recorded no console errors, failed requests or unexpected page overflow. Subsequent changes to the accessible logo and Motion bundle were checked through the affected browser/motion tests.

Automated checks and visual inspection support these results; they are not a claim of independent accessibility certification or exhaustive assistive-technology testing.

## Performance

Production `out/` served locally with gzip. Device: Windows, AMD Ryzen 5 4600HS, Node 24.19.0, Playwright Chromium. Lighthouse used mobile simulated throttling.

| Representative route | Performance | Accessibility | Best practices | SEO | CLS |
|---|---:|---:|---:|---:|---:|
| Report home | 99 | 100 | 100 | 60 | 0 |
| Studio overview | 94 | 100 | 100 | 60 | 0 |
| Text Explorer | 99 | 100 | 100 | 60 | 0 |

The SEO score loses 40 points solely for intentionally blocking indexing. No other SEO audit failed. This preserves the approved academic-preview setting rather than changing the audience to meet a score.

Initial Report JavaScript measured **204,031 bytes gzip** (199.2 KiB): a **2.0% exception** to a decimal 200 KB target. Studio overview total was 428,507 bytes, an additional **224,476 bytes** over Report, below the additional 400 KB target. Text Explorer loaded 211,508 bytes of JavaScript; its corpus is fetched separately. The small initial Report exception includes the shared Next/React/Motion runtime and report explorers.

Across 25 ordinary provider changes, median update latency was **25.6 ms**, p95 **41.8 ms**, maximum **43.6 ms**. These measure committed sample counts and chart denominators; the visible transition settles afterward. Bootstrap and permutation calculations run asynchronously in a worker and cache by dataset hash and analytical inputs.

Detailed JSON results and screenshots are generated in `test-results/` by the documented commands. They remain local rather than being included in the public static output. Results vary with device load and browser versions.

## Retained evidence limitations

The original PowerPoint, recruitment details, collection dates, population coverage and original questionnaire response labels were not supplied. Owner confirmation of customer origin and scale direction is disclosed. No representative-sample claim, causal claim, overall winner, SERVQUAL gap, validated composite score, physical-tangibles rating or NPS is generated. External claims retain their definitions, source links and verified reporting periods.

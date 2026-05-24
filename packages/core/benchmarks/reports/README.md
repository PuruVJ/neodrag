# Benchmark reports

| File | Tracked in git | Purpose |
|------|----------------|---------|
| `baseline.json` | yes | Reference medians for regression checks |
| `latest.json` | no | Output of the most recent `pnpm bench` run |

After changing performance-sensitive code:

```bash
cd packages/core
pnpm bench              # runs perf suite, writes latest.json, compares to baseline
pnpm bench:baseline     # promote latest.json → baseline.json (when intentional)
```

`pnpm test:bench:guard` runs guard suites with budgets but does not update these files.

Regression policy: a benchmark **fails** if median latency exceeds baseline × 1.15 (15% slower).

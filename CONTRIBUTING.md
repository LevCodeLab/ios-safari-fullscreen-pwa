# contributing

safari bugs are easier when we fight them together bhai.

## quick setup

```bash
npm install
npm test
npm run build
```

## simple rules

* keep all buttons and badges strictly monochrome (`#141418`, `#26262E`, `#FFFFFF`, `#000000`).
* never put `overflow: hidden` on `body` because it breaks Safari floating bar minimization.
* test safe area clearance math with `npm test` before sending a pull request.

# WebUI Guidelines

## Scope

Use this guidance when changing anything in `webui/` or `webroot/`.

## Hosting Model

- `webui/` is a KernelSU/APatch embedded WebUI.
- `webroot/` is the production output consumed by the host manager.
- Do not assume normal web hosting, SPA history fallback, reverse proxies, or custom middleware.

## Build Rules

- If the repo already uses Vite, keep that toolchain unless there is a strong reason to replace it.
- Emit production files into `webroot/`.
- Keep asset paths relative for embedded hosting. `./assets/...` is the safe default.
- Treat root-relative `/assets/...` paths as a likely regression unless host behavior proves otherwise.
- Avoid changes that require server rewrites or non-static runtime behavior.

## Commands

- Dev server: `cd webui && npm run dev`
- Type check: `cd webui && npm run check`
- Production build: `cd webui && npm run build`

## Validation

Run this after WebUI changes:

```sh
cd webui && npm run check && npm run build
sed -n '1,40p' ../webroot/index.html
```

Confirm that the built `webroot/index.html` references `./assets/...`.

## Code Style

- Keep TypeScript strict and prefer small, direct modules over framework-heavy abstractions.
- Preserve the existing Material Web and vanilla CSS approach unless the task explicitly changes the stack.
- Prefer module config or script-backed persistence over `localStorage` for important settings.

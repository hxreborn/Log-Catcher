# Module Runtime

## Scope

Use this guidance when changing shell scripts, packaging behavior, module metadata, or on-device paths.

## Layout

- `module.prop` stores module metadata and must keep `id=hwr_logcat`.
- Core scripts live at repo root: `post-fs-data.sh`, `service.sh`, `customize.sh`, `utils.sh`.
- Installer bootstrap files live under `META-INF/`.
- Linux packaging uses `packup.sh`.
- Windows helpers: `packupzip.bat`, `packupzipandinstall.bat`, `start_test.bat`, `stop_test.bat`.

## Shell Rules

- Use BusyBox/POSIX `sh` and keep `# shellcheck shell=busybox` headers.
- Use 2-space indentation for new blocks and preserve surrounding style.
- Use `MODDIR=${0%/*}` for module-relative paths rather than hardcoding installed paths.
- Prefer uppercase names for constants and paths such as `LOG_PATH`.
- Prefer `lower_snake_case` for functions such as `get_time`.

## Runtime Expectations

- Logs are captured early during `post-fs-data.sh` and finalized in `service.sh`.
- Expected working directories are `/cache/bootlog` or `/data/local/bootlog`.
- Expected exported archives are `/sdcard/Download/bootlog-*.tar.gz`.
- Persistent logging is toggled by `/data/local/logcatcher/boot.lcs`.

## Safety

- Scripts run as root on device.
- Avoid wide deletes and broad `rm` usage.
- Keep file mutations scoped to module-owned paths and known export directories.

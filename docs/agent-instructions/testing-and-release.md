# Testing And Release

## Testing

- There is no automated test suite; validate on a rooted Android device.
- Preferred root managers for coverage: KernelSU, APatch, and where relevant Magisk.
- Manual runtime checks:
  - `adb shell su -c "sh /data/adb/modules/hwr_logcat/post-fs-data.sh"`
  - `adb shell su -c "sh /data/adb/modules/hwr_logcat/service.sh"`
- Verify archive output under `/cache/bootlog` or `/data/local/bootlog` and `/sdcard/Download/bootlog-*.tar.gz`.
- For WebUI work, build locally and then verify behavior inside the actual manager app when possible.

## Packaging

- Linux/macOS: `./packup.sh`
- Windows: `packupzip.bat`
- Package contents must include `META-INF/**`, `webroot/**`, `*.prop`, and `*.sh`.

## Release Hygiene

- If behavior changes or a release is being prepared, update `module.prop` version and `versionCode`.
- Keep README and other docs aligned with user-visible behavior changes.
- Commit messages should stay short, imperative, and sentence-case.

## PR Notes

- Include device, ROM, Android version, root manager, and test results.
- Attach relevant log snippets or archive examples when they help explain behavior changes.

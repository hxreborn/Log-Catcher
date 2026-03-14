# Log-Catcher

Capture the boot logs to /cache/bootlog or /data/local/bootlog if /cache does not exist.

After unlocking, package them to /sdcard/Download/bootlog-**.tar.gz.

This module can help you save startup logs.

If you don't want to stop log catching after unlocking, create a file named `/data/local/logcatcher/boot.lcs`

## Credits

- [MlgmXyysd](https://github.com/MlgmXyysd) (Jaida Wu) -- original [Log-Catcher](https://github.com/MlgmXyysd/Log-Catcher) project
- [Howard20181](https://github.com/Howard20181) (Howard Wu) -- [maintained fork](https://github.com/Howard20181/Log-Catcher) with additional features
- [hxreborn](https://github.com/hxreborn) -- KernelSU WebUI, configurable runtime, packaging

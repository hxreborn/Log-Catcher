# Log Catcher

Magisk/KernelSU module that captures logcat and kernel messages during boot, saved as timestamped `bootlog-*.tar.gz` files.

## Compatibility

| Root manager | Log capture | WebUI |
|---|---|---|
| KernelSU | Yes | Yes |
| APatch | Yes | Yes |
| Magisk | Yes | No |

## Persistent Logging

By default, capture stops after boot completes. To keep logging, create `/data/local/logcatcher/boot.lcs`. Logs will be saved on next boot instead.

## Credits

- [MlgmXyysd](https://github.com/MlgmXyysd) (Jaida Wu) -- original [Log-Catcher](https://github.com/MlgmXyysd/Log-Catcher) project
- [Howard20181](https://github.com/Howard20181) (Howard Wu) -- [maintained fork](https://github.com/Howard20181/Log-Catcher) with additional features
- [hxreborn](https://github.com/hxreborn) -- KernelSU WebUI, configurable runtime, packaging

# Log Catcher

[![Magisk](https://img.shields.io/badge/Magisk-00AF9C?style=flat-square&logo=magisk&logoColor=white)](https://github.com/topjohnwu/Magisk)
[![KernelSU](docs/assets/badges/kernelsu.svg)](https://kernelsu.org)
[![APatch](docs/assets/badges/apatch.svg)](https://apatch.dev)

Captures logcat and kernel messages during startup and archives them as timestamped tarballs after unlock. Supports configurable buffers, export path, max files, cleanup rules, and optional persistent logging.

## Supported Root Managers

Magisk (manual config only), KernelSU, APatch.

## Configuration

On KernelSU/APatch, use the module WebUI.

On Magisk, edit `/data/local/logcatcher/config`:

```sh
EXPORT_PATH=/sdcard/Download
MAX_LOGS=10
PRUNE_DAYS=7
BUFFERS=main,system,crash
PERSISTENT=false
```

## Credits

- [Jaida Wu](https://github.com/MlgmXyysd) - original [Log-Catcher](https://github.com/MlgmXyysd/Log-Catcher) project
- [Howard Wu](https://github.com/Howard20181) - updated fork with additional features

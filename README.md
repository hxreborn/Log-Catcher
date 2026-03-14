# Log Catcher

[![Magisk](https://img.shields.io/badge/Magisk-00AF9C?style=flat-square&logo=magisk&logoColor=white)](https://github.com/topjohnwu/Magisk)
[![KernelSU](docs/assets/badges/kernelsu.svg)](https://kernelsu.org)
[![APatch](docs/assets/badges/apatch.svg)](https://apatch.dev)

Captures boot logs (logcat + kernel messages) during system startup and packages them as `bootlog-*.tar.gz` in `/sdcard/Download/`.

## Features

- Captures logcat and kernel messages from early boot
- Packages logs as timestamped tarballs after unlock
- Configurable buffers, export path, max files, and auto-cleanup
- Optional persistent logging past boot
- KernelSU/APatch WebUI for on-device log management

## Configuration

On KernelSU/APatch, open the module's WebUI to configure export path, cleanup rules, persistent logging, and log buffers.

On Magisk (no WebUI), edit `/data/local/logcatcher/config`:

```sh
EXPORT_PATH=/sdcard/Download
MAX_LOGS=10
PRUNE_DAYS=7
BUFFERS=main,system,crash
PERSISTENT=false
```

## Credits

- [MlgmXyysd](https://github.com/MlgmXyysd) (Jaida Wu) - original [Log-Catcher](https://github.com/MlgmXyysd/Log-Catcher) project
- [Howard20181](https://github.com/Howard20181) (Howard Wu) - updated fork with additional features

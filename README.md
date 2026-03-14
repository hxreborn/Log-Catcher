# Log Catcher

[![Magisk](https://img.shields.io/badge/Magisk-00AF9C?style=flat-square&logo=magisk&logoColor=white)](https://github.com/topjohnwu/Magisk)
[![KernelSU](https://img.shields.io/badge/KernelSU-1e2327?style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAA5UExURSMYFSQZFk9GQ2RcWmNbWWBYVjYsKSYbGLOvrvn5+fb19fb29u3s7Lm2tf///7y4tyccGYmDgv///xTOzWQAAAABYktHRBJ7vGwAAAAAB3RJTUUH6gMODBYLXiQKnAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNi0wMy0xNFQxMjoyMjowMSswMDowMIkRC2oAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjYtMDMtMTRUMTI6MjI6MDErMDA6MDD4TLPWAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI2LTAzLTE0VDEyOjIyOjExKzAwOjAwY/OSlwAAAFpJREFUCNd1yzsSACEIA1BU8IMiev/L7qBrYWG6l0kAVpwPiEhxC1IuzLXRofTee8WL/KIaSwCXLGOqiGQPPouIzrFaB6HYTNP/QjbKi/Uitcpc8mEkRAzebX3o9wSnoUC8xwAAAABJRU5ErkJggg==)](https://kernelsu.org)
[![APatch](https://img.shields.io/badge/APatch-081B11?style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAMAAAAolt3jAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAADkUExURQgbEQgaEQgaEAgdEgkfFAkeEwYRCwkdEwgcEhdiPBFEKhdjPAgcEQgZEAsrGhlqQBA/JhA+JhlpQAwrGwUMCBhmPQ45IwojFgokFg44IhhnPgUNCQcYDwsqGhZdOB18Sx+GUB6BTh6CTh+GUR19SwYUDQ88JR6DTxlsQQsnGBRVMwomFxlrQAcVDQ86Ixt0RhhjPBFEKSalYiOWWg43IhhkPAcUDSCLVBdgOg41IB6ATCCKUhZcOA85Iw86JBhlPQ0yHhJKLBJILAwvHRdhOhdfOQ0wHhZaNxVZNgomGAcXD////4YPJ4wAAAABYktHREtpC4VQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6gMODBYLXiQKnAAAAKNJREFUCNc1ztkaQlAYheHf3uykTRqohEaUikaaVZq4/wvq0cM6e4++BQAADMIYMZAPsRwhJRYV5suCUKEFRKkq1+oNkc9EUVNRW+2O1kUUgOqG2esPhqOxKekUsGU7k6nrzuaObWHAC89frtab7c73Agw4UMP94XiSz+ElwFn1Gt3ujzjy8jKJtedLeZM8zJHo81UIV7wSjSSRxEJAU11P/yd/YOgP7EFVFHoAAAAASUVORK5CYII=)](https://apatch.dev)

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

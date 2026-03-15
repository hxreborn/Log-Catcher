## v23.2

### New features
- Ramoops capture: previous boot's kernel crash log pulled from pstore and included in the archive automatically
- Export path folder picker: browse the filesystem instead of typing the path manually

### WebUI
- Loading splash with M3 circular progress spinner
- Simplified to settings-only UI; use a file manager to access log archives in the export path

### Under the hood
- Removed .bat files so repo is now Microslop-free
- Dropped date-fns and pretty-bytes dependencies

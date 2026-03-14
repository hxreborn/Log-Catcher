#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/webui" && npm run build && cd ..
id=$(grep '^id=' module.prop | cut -d= -f2)
rm -f "$id.zip"
zip -r "$id.zip" META-INF webroot *.prop *.sh
echo "Created $id.zip"

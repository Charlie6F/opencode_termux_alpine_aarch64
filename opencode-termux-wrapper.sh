#!/bin/bash

# This script acts as a wrapper to run the opencode binary within the proot-distro Alpine environment.
# It passes all arguments directly to the opencode binary.

proot-distro login alpine --termux-home -- sh -c '\
  apk add --no-cache jq # Ensure jq is installed\
  mkdir -p /root/.config/opencode\
  CONFIG_FILE="/root/.config/opencode/config.json"\
  if [ -f "$CONFIG_FILE" ]; then\
    jq \'.autoupdate = false\' "$CONFIG_FILE" > "${CONFIG_FILE}.tmp" && mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"\
  else\
    echo \'{"autoupdate": false}\' > "$CONFIG_FILE"\
  fi\
  env OPENCODE_DISABLE_AUTOUPDATE=true /usr/local/bin/opencode "$@"\
'
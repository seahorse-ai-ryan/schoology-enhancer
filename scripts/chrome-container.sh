#!/bin/bash
# Wrapper to run Chromium in container with necessary flags
# Container environments require --no-sandbox flag

exec chromium \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  "$@"

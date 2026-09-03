#!/bin/bash
# Double-click this file to start the Satnam Threads website.
cd "$(dirname "$0")"
echo "Starting Satnam Threads…"
( sleep 2; open http://localhost:3000 ) &
node --no-warnings server.js

#!/bin/bash
# Set required environment variables
export NODE_OPTIONS=--openssl-legacy-provider
export TERM=xterm-256color

# Kill any processes running on port 4200
lsof -ti:4200 | xargs kill -9 2>/dev/null || true

# Clear previous build cache
rm -rf .angular/

# Wait for the port to be released
sleep 2

# Start the Angular development server on port 4201
node --max_old_space_size=4096 node_modules/@angular/cli/bin/ng serve --host 0.0.0.0 --port 4201 --disable-host-check

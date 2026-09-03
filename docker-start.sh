#!/bin/sh

# Ensure the persistent data directory and uploads directory exist
mkdir -p /data/uploads

# If public/uploads is a real directory (not a symlink), move its contents to the persistent volume
if [ -d "public/uploads" ] && [ ! -L "public/uploads" ]; then
    cp -r public/uploads/* /data/uploads/ 2>/dev/null || true
    rm -rf public/uploads
fi

# Create a symlink from public/uploads to the persistent /data/uploads
ln -s /data/uploads public/uploads

# Start the node server
exec npm start

#!/bin/sh
set -e

until mc alias set local http://minio:9000 minioadmin minioadmin; do
  echo "Waiting for MinIO..."
  sleep 1
done

mc mb --ignore-existing local/animora

mc anonymous set-json /policy.json local/animora

echo "MinIO init complete"

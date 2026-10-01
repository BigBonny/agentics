#!/bin/bash

# Manual bucket creation using Supabase REST API
# Run this in your terminal (requires curl)

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:?Set NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Set SUPABASE_SERVICE_ROLE_KEY (never commit it)}"

echo "🪣 Creating course-images bucket..."

# Create bucket
curl -X POST "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "course-images",
    "name": "course-images",
    "public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
  }'

echo -e "\n✅ Bucket creation request sent"

# Check if bucket exists
echo -e "\n🔍 Checking bucket status..."
curl -X GET "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "apikey: ${SERVICE_ROLE_KEY}"

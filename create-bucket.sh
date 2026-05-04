#!/bin/bash

# Manual bucket creation using Supabase REST API
# Run this in your terminal (requires curl)

SUPABASE_URL="https://gepewyneclxpupymvsxv.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcGV3eW5lY2x4cHVweW12c3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk4NTcwOSwiZXhwIjoyMDg5NTYxNzA5fQ.hvpvu9yBeZPvWB0qVmgnDhVhE6OZiM1flKz9L--lvMM"

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

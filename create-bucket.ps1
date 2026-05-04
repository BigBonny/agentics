# Manual bucket creation using Supabase REST API
# Run this in PowerShell

$SUPABASE_URL = "https://gepewyneclxpupymvsxv.supabase.co"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcGV3eW5lY2x4cHVweW12c3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk4NTcwOSwiZXhwIjoyMDg5NTYxNzA5fQ.hvpvu9yBeZPvWB0qVmgnDhVhE6OZiM1flKz9L--lvMM"

Write-Host "🪣 Creating course-images bucket..." -ForegroundColor Green

# Create bucket
$body = @{
    id = "course-images"
    name = "course-images"
    public = $true
    file_size_limit = 10485760
    allowed_mime_types = @("image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf")
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/storage/v1/bucket" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $SERVICE_ROLE_KEY"
            "Content-Type" = "application/json"
        } `
        -Body $body
    
    Write-Host "✅ Bucket creation successful!" -ForegroundColor Green
    Write-Host $response
} catch {
    Write-Host "❌ Bucket creation failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n🔍 Checking bucket status..." -ForegroundColor Yellow

try {
    $buckets = Invoke-RestMethod -Uri "$SUPABASE_URL/storage/v1/bucket" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $SERVICE_ROLE_KEY"
            "apikey" = $SERVICE_ROLE_KEY
        }
    
    Write-Host "Current buckets:"
    $buckets | ForEach-Object {
        Write-Host "- $($_.name) (Public: $($_.public))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to check buckets:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

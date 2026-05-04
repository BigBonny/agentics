# Manual Bucket Creation Guide

## Current Status:
- ✅ Upload API is working
- ❌ Storage bucket "course-images" doesn't exist
- ❌ SQL permissions limited

## Step 1: Create Bucket Manually in Dashboard

### Method A: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "New bucket" button

3. **Create Bucket Settings:**
   - **Name:** `course-images`
   - **Public bucket:** ✅ (check this box)
   - **File size limit:** `10485760` (10MB)
   - **Allowed MIME types:** `image/jpeg,image/png,image/gif,image/webp,application/pdf`

4. **Click "Save"**

### Method B: If Method A Fails

1. **Use API Key Method:**
   ```bash
   curl -X POST "https://gepewyneclxpupymvsxv.supabase.co/storage/v1/bucket" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "id": "course-images",
       "name": "course-images",
       "public": true,
       "file_size_limit": 10485760,
       "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
     }'
   ```

## Step 2: Set Up Policies (After Bucket Creation)

Run this SQL in Supabase SQL Editor:

```sql
-- Create simple policy for the bucket
CREATE POLICY "course_images_policy" ON storage.objects
FOR ALL USING (bucket_id = 'course-images');
```

## Step 3: Verify Bucket Exists

1. **Test the bucket:**
   ```
   http://localhost:3000/api/test-storage
   ```

2. **Expected result:**
   ```json
   {
     "success": true,
     "courseBucketExists": true,
     "courseBucketDetails": {
       "id": "course-images",
       "name": "course-images",
       "public": true
     }
   }
   ```

## Step 4: Try Upload Again

1. **Go to:** `http://localhost:3000/admin/courses`
2. **Click:** "Téléverser en lot"
3. **Select:** Your "Math SIO.pdf"
4. **Click:** "Téléverser 1 cours"

## Expected Console Output:

```
📤 Uploading course file: {
  courseId: 'new',
  title: 'Math SIO',
  fileName: 'Math SIO.pdf',
  fileType: 'application/pdf'
}
✅ course-images bucket found
✅ Course file uploaded successfully: abc123
```

## Troubleshooting:

### If Bucket Creation Fails:
1. **Check your Supabase permissions**
2. **Try with a different bucket name** (e.g., `course-images-v2`)
3. **Contact Supabase support** for storage permissions

### If Upload Still Fails:
1. **Verify bucket is public**
2. **Check MIME type restrictions**
3. **Review RLS policies**

## Alternative: Use Different Storage

If Supabase Storage continues to fail, we can:
1. **Use local file storage** temporarily
2. **Switch to Cloudinary** or other CDN
3. **Use AWS S3** with proper permissions

## Next Steps:

Once bucket is created:
- ✅ PDF uploads will work
- ✅ AI content extraction will start
- ✅ Courses will appear in management interface
- ✅ Your book scans will be processed

-- Add support for image-based courses with AI content extraction
-- This migration adds fields for storing course images and AI-extracted content

-- Add image_url field to courses table for course cover images
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add content_type field to distinguish between text and image-based courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'text';

-- Add ai_extracted_content field for storing AI-extracted text from images
ALTER TABLE courses ADD COLUMN IF NOT EXISTS ai_extracted_content JSONB;

-- Add extraction_status field to track AI processing status
ALTER TABLE courses ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(20) DEFAULT 'pending';

-- Add extraction_confidence field for AI extraction confidence scores
ALTER TABLE courses ADD COLUMN IF NOT EXISTS extraction_confidence DECIMAL(3,2);

-- Create index for extraction_status filtering
CREATE INDEX IF NOT EXISTS idx_courses_extraction_status ON courses(extraction_status);

-- Create table for course image pages/slides
CREATE TABLE IF NOT EXISTS course_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  image_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for course_images
CREATE INDEX IF NOT EXISTS idx_course_images_course_id ON course_images(course_id);
CREATE INDEX IF NOT EXISTS idx_course_images_page_number ON course_images(course_id, page_number);

-- Add RLS policies for course_images
ALTER TABLE course_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view course images for their courses" ON course_images
  FOR SELECT USING (
    course_id IN (
      SELECT id FROM courses WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert course images for their courses" ON course_images
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update course images for their courses" ON course_images
  FOR UPDATE USING (created_by = auth.uid());

-- Comments for new fields
COMMENT ON COLUMN courses.image_url IS 'URL to course cover/preview image';
COMMENT ON COLUMN courses.content_type IS 'Type: text, image, or mixed';
COMMENT ON COLUMN courses.ai_extracted_content IS 'AI-extracted content from course images';
COMMENT ON COLUMN courses.extraction_status IS 'pending, processing, completed, failed';
COMMENT ON COLUMN courses.extraction_confidence IS 'AI confidence score (0.00-1.00)';
COMMENT ON TABLE course_images IS 'Individual pages/slides from course images';

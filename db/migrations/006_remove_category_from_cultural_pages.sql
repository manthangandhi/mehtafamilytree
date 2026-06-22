-- =====================================================
-- Remove category column from cultural_pages
-- Category field has been removed from the application
-- =====================================================

-- Drop the index first
DROP INDEX IF EXISTS idx_cultural_pages_category;

-- Drop the column (this also removes the CHECK constraint)
ALTER TABLE public.cultural_pages 
DROP COLUMN IF EXISTS category;

-- Note: Existing data in this column will be permanently deleted.
-- If you need to preserve historical category values, export them first.

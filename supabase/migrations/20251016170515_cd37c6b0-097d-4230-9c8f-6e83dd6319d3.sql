-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-files',
  'evidence-files',
  false,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'audio/mp3', 'audio/mpeg', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf']
);

-- Allow authenticated users to upload their own evidence files
CREATE POLICY "Authenticated users can upload evidence files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence-files' AND
  (has_role(auth.uid(), 'fsl_officer') OR has_role(auth.uid(), 'police') OR has_role(auth.uid(), 'evidence_room') OR is_admin(auth.uid()))
);

-- Allow authenticated users to view evidence files
CREATE POLICY "Authenticated users can view evidence files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'evidence-files');

-- Allow authorized users to delete evidence files
CREATE POLICY "Authorized users can delete evidence files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'evidence-files' AND
  (has_role(auth.uid(), 'fsl_officer') OR has_role(auth.uid(), 'evidence_room') OR is_admin(auth.uid()))
);
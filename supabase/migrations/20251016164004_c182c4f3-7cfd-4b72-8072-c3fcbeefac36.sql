-- Create table for deleted evidence audit trail
CREATE TABLE public.deleted_evidence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_evidence_id uuid NOT NULL,
  evidence_number text NOT NULL,
  case_number text NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  storage_url text,
  hash_value text NOT NULL,
  location text,
  status text NOT NULL,
  notes text,
  collected_by uuid,
  collected_at timestamp with time zone NOT NULL,
  deleted_by uuid REFERENCES auth.users(id),
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  deletion_reason text
);

-- Enable RLS on deleted_evidence table
ALTER TABLE public.deleted_evidence ENABLE ROW LEVEL SECURITY;

-- RLS policies for deleted_evidence table
CREATE POLICY "Authenticated users can view deleted evidence"
ON public.deleted_evidence
FOR SELECT
USING (true);

CREATE POLICY "Authorized users can insert deleted evidence records"
ON public.deleted_evidence
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'fsl_officer'::app_role) OR 
  has_role(auth.uid(), 'evidence_room'::app_role) OR 
  is_admin(auth.uid())
);
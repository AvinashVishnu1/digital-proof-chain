-- Add DELETE policy for evidence table
CREATE POLICY "Authorized users can delete evidence"
ON public.evidence
FOR DELETE
USING (
  has_role(auth.uid(), 'fsl_officer'::app_role) OR 
  has_role(auth.uid(), 'evidence_room'::app_role) OR 
  is_admin(auth.uid())
);

-- Create cases table to track case status
CREATE TABLE public.cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on cases table
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- RLS policies for cases table
CREATE POLICY "Authenticated users can view cases"
ON public.cases
FOR SELECT
USING (true);

CREATE POLICY "Authorized users can insert cases"
ON public.cases
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'fsl_officer'::app_role) OR 
  has_role(auth.uid(), 'police'::app_role) OR 
  has_role(auth.uid(), 'evidence_room'::app_role) OR 
  is_admin(auth.uid())
);

CREATE POLICY "Authorized users can update cases"
ON public.cases
FOR UPDATE
USING (
  has_role(auth.uid(), 'fsl_officer'::app_role) OR 
  has_role(auth.uid(), 'evidence_room'::app_role) OR 
  is_admin(auth.uid())
);

-- Add trigger for updated_at on cases
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Update the INSERT policy on evidence table to allow evidence_room users
DROP POLICY IF EXISTS "FSL officers and police can create evidence" ON public.evidence;

CREATE POLICY "Authorized users can create evidence" 
ON public.evidence 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'fsl_officer'::app_role) 
  OR has_role(auth.uid(), 'police'::app_role) 
  OR has_role(auth.uid(), 'evidence_room'::app_role)
  OR is_admin(auth.uid())
);
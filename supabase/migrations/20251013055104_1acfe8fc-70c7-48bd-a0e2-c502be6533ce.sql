-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'police', 'fsl_officer', 'evidence_room', 'investigation_officer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  badge_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Create areas table
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create police stations table
CREATE TABLE public.police_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
  address TEXT,
  phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create forensic labs table
CREATE TABLE public.forensic_labs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  area_id UUID REFERENCES public.areas(id) ON DELETE CASCADE,
  address TEXT,
  phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create evidence table
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL,
  evidence_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  collected_by UUID REFERENCES auth.users(id),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  hash_value TEXT NOT NULL,
  storage_url TEXT,
  status TEXT NOT NULL DEFAULT 'collected',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create chain of custody table
CREATE TABLE public.custody_chain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  transferred_from UUID REFERENCES auth.users(id),
  transferred_to UUID REFERENCES auth.users(id),
  transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT NOT NULL,
  purpose TEXT NOT NULL,
  condition TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_chain ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Areas policies
CREATE POLICY "Authenticated users can view areas"
  ON public.areas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage areas"
  ON public.areas FOR ALL
  USING (public.is_admin(auth.uid()));

-- Police stations policies
CREATE POLICY "Authenticated users can view police stations"
  ON public.police_stations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage police stations"
  ON public.police_stations FOR ALL
  USING (public.is_admin(auth.uid()));

-- Forensic labs policies
CREATE POLICY "Authenticated users can view forensic labs"
  ON public.forensic_labs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage forensic labs"
  ON public.forensic_labs FOR ALL
  USING (public.is_admin(auth.uid()));

-- Evidence policies
CREATE POLICY "Users can view evidence"
  ON public.evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "FSL officers and police can create evidence"
  ON public.evidence FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'fsl_officer') OR
    public.has_role(auth.uid(), 'police') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Authorized users can update evidence"
  ON public.evidence FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'fsl_officer') OR
    public.has_role(auth.uid(), 'evidence_room') OR
    public.is_admin(auth.uid())
  );

-- Custody chain policies
CREATE POLICY "Users can view custody chain"
  ON public.custody_chain FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Evidence handlers can add custody records"
  ON public.custody_chain FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'evidence_room') OR
    public.has_role(auth.uid(), 'fsl_officer') OR
    public.is_admin(auth.uid())
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
  BEFORE UPDATE ON public.evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

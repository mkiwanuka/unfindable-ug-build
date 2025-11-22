-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('guest', 'requester', 'finder', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  location TEXT,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  balance DECIMAL(10, 2) DEFAULT 0,
  skills TEXT[],
  rating DECIMAL(3, 2),
  completed_tasks INTEGER DEFAULT 0,
  response_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10, 2) NOT NULL,
  budget_max DECIMAL(10, 2) NOT NULL,
  deadline TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed')),
  offer_count INTEGER DEFAULT 0,
  image_url TEXT,
  posted_by_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for requests
CREATE POLICY "Anyone can view open requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create requests"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = posted_by_id);

CREATE POLICY "Users can update own requests"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = posted_by_id);

CREATE POLICY "Users can delete own requests"
  ON public.requests FOR DELETE
  TO authenticated
  USING (auth.uid() = posted_by_id);

-- Trigger to update profiles timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
  );
  
  -- Assign default 'requester' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'requester');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
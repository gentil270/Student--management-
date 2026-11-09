CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reg_number text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  course text NOT NULL,
  gender text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public delete" ON public.students FOR DELETE TO anon, authenticated USING (true);
INSERT INTO public.students (reg_number, full_name, email, phone, course, gender) VALUES
('EAV/2026/001','Amani Uwase','amani@eavkivumu.rw','0788000001','Software Development','Female'),
('EAV/2026/002','Jean Habimana','jean@eavkivumu.rw','0788000002','Networking','Male'),
('EAV/2026/003','Grace Mukamana','grace@eavkivumu.rw','0788000003','Accounting','Female');
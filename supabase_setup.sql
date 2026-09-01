-- Script สำหรับสร้างตาราง edit_logs ในฐานข้อมูล Supabase

CREATE TABLE public.edit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_count INTEGER NOT NULL,
    new_count INTEGER NOT NULL,
    old_rate DECIMAL NOT NULL,
    new_rate DECIMAL NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตั้งค่าความปลอดภัย (RLS)
ALTER TABLE public.edit_logs ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้ทุกคน insert ได้ (ผ่าน Server Action)
CREATE POLICY "Allow insert for all users" ON public.edit_logs
    FOR INSERT WITH CHECK (true);

-- อนุญาตให้แอดมินดูได้ทุกคน, พนักงานดูได้เฉพาะของตัวเอง
CREATE POLICY "Allow select for owner or admin" ON public.edit_logs
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

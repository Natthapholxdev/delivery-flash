import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <main className="mx-auto">
        {children}
      </main>
    </div>
  )
}

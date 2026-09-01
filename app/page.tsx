import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UserApp from '@/components/UserApp'
import { logout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, role, status')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/login')
    }

    // Protect main page from admin
    if (profile.role === 'admin') {
        redirect('/admin')
    }

    if (profile.status === 'pending') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">รอการอนุมัติ</h2>
                    <p className="text-gray-600 mb-6">บัญชีของคุณกำลังรอการตรวจสอบจากผู้ดูแลระบบ กรุณากลับมาใหม่ภายหลัง</p>
                    <form action={logout}>
                        <button type="submit" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                            <LogOut className="w-4 h-4 mr-2" />
                            ออกจากระบบ
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return <UserApp username={profile.username} />
}

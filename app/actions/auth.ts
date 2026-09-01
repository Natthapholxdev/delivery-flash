'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

function generatePseudoEmail(username: string) {
  return `${username.toLowerCase().trim()}@deliveryapp.com`
}

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const pin = formData.get('pin') as string
  const isAdminLogin = formData.get('isAdminLogin') === 'true'

  if (!username || !pin) {
    return { error: 'กรุณากรอก Username และ PIN' }
  }

  const email = generatePseudoEmail(username)
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  })

  if (error) {
    return { error: 'Username หรือ PIN ไม่ถูกต้อง' }
  }

  const cookieStore = await cookies()
  cookieStore.set('login_time', Date.now().toString(), { maxAge: 3600 })

  // Check role & status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single()

  if (profile) {
    if (isAdminLogin && profile.role !== 'admin') {
      await supabase.auth.signOut()
      return { error: 'คุณไม่มีสิทธิ์เข้าถึงระบบ Admin' }
    }
  }

  if (isAdminLogin) {
    redirect('/admin')
  } else {
    redirect('/')
  }
}

export async function register(formData: FormData) {
  const username = formData.get('username') as string
  const pin = formData.get('pin') as string

  if (!username || !pin || pin.length < 6) {
    return { error: 'กรุณากรอก Username และ PIN (อย่างน้อย 6 หลัก)' }
  }

  const email = generatePseudoEmail(username)
  const supabaseAdmin = createAdminClient()

  // ใช้ Admin Client เพื่อข้ามข้อจำกัดการยืนยัน Email
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: pin,
    email_confirm: true,
    user_metadata: {
      username: username.trim(),
    }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Username นี้มีผู้ใช้งานแล้ว' }
    }
    return { error: error.message }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfiles() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) return { error: error.message }
    return { data }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
    const supabase = await createClient()
    const newStatus = currentStatus === 'pending' ? 'approved' : 'pending'
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
}

export async function saveKioskDeliveries(userId: string, deliveries: { rate: number, count: number }[], date: string) {
    const supabase = await createClient()
    const records = deliveries.map(d => ({
        user_id: userId,
        delivery_date: date,
        quantity: d.count,
        rate_per_piece: d.rate
    }))
    const { error } = await supabase.from('deliveries').insert(records)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
}

export async function getAllDeliveries() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('deliveries')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
    if (error) return { error: error.message }
    return { data }
}

export async function deleteDelivery(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('deliveries').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
}

export async function updateDeliveryRate(id: string, rate: number) {
    const supabase = await createClient()
    const { error } = await supabase.from('deliveries').update({ rate_per_piece: rate }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
}

import { createAdminClient } from '@/utils/supabase/admin'

function generatePseudoEmail(username: string) {
  return `${username.toLowerCase().trim()}@deliveryapp.com`
}

export async function addEmployeeByAdmin(username: string, pin: string) {
    if (!username || !pin || pin.length < 6) {
        return { error: 'à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸ Username à¹à¸¥à¸° PIN (à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 6 à¸«à¸¥à¸±à¸)' }
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    const email = generatePseudoEmail(username)
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: pin,
        email_confirm: true,
        user_metadata: { username: username.trim() }
    })

    if (error) {
        if (error.message.includes('already registered')) return { error: 'Username à¸™à¸µà¹‰à¸¡à¸µà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¹à¸¥à¹‰à¸§' }
        return { error: error.message }
    }
    
    await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        username: username.trim(),
        role: 'user',
        status: 'approved'
    })

    revalidatePath('/admin')
    return { success: true }
}

export async function getEditLogs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // verify admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Forbidden' }

    const { data, error } = await supabase
        .from('edit_logs')
        .select(`
            *,
            profiles:user_id(username)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) return { error: error.message }
    return { data }
}

export async function importCSVData(userId: string, records: { delivery_date: string, quantity: number, rate_per_piece: number, created_at: string }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // verify admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Forbidden' }

    // Map records to include the new user_id
    const dbRecords = records.map(r => ({
        user_id: userId,
        delivery_date: r.delivery_date,
        quantity: r.quantity,
        rate_per_piece: r.rate_per_piece,
        created_at: r.created_at || new Date().toISOString()
    }))

    // Use insert (without ID to generate new ones)
    const { error } = await supabase.from('deliveries').insert(dbRecords)
    
    if (error) return { error: error.message }
    
    revalidatePath('/admin')
    return { success: true }
}

export async function checkExistingDelivery(userId: string, date: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') return { error: 'Forbidden' }

        const { data, error } = await supabase
            .from('deliveries')
            .select('quantity, rate_per_piece')
            .eq('user_id', userId)
            .eq('delivery_date', date)
            .single()

        if (error && error.code !== 'PGRST116') return { error: error.message }
        return { data }
    } catch (e: any) {
        return { error: e.message }
    }
}

'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDeliveries(deliveries: { rate: number, count: number }[], date: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const records = deliveries.map(d => ({
        user_id: user.id,
        delivery_date: date,
        quantity: d.count,
        rate_per_piece: d.rate
    }))

    const { error } = await supabase.from('deliveries').insert(records)
    
    if (error) {
        return { error: error.message }
    }
    
    revalidatePath('/')
    return { success: true }
}

export async function getMyDeliveries() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: false })
        .order('created_at', { ascending: false })
    
    if (error) return { error: error.message }
    return { data }
}

export async function editDelivery(deliveryId: string, newCount: number, newRate: number, reason: string) {
    if (!reason || reason.trim() === '') return { error: 'กรุณาระบุเหตุผลในการแก้ไข' }
    if (newCount < 0 || newRate < 0) return { error: 'ข้อมูลไม่ถูกต้อง' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch old delivery
    const { data: oldDelivery, error: fetchErr } = await supabase
        .from('deliveries')
        .select('*')
        .eq('id', deliveryId)
        .eq('user_id', user.id)
        .single()
    
    if (fetchErr || !oldDelivery) return { error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' }

    // 1. Log the edit
    const { error: logErr } = await supabase
        .from('edit_logs')
        .insert({
            delivery_id: deliveryId,
            user_id: user.id,
            old_count: oldDelivery.quantity,
            new_count: newCount,
            old_rate: oldDelivery.rate_per_piece,
            new_rate: newRate,
            reason: reason.trim()
        })
    
    if (logErr) return { error: 'ไม่สามารถบันทึกประวัติการแก้ไขได้ (ตารางอาจยังไม่ถูกสร้าง): ' + logErr.message }

    // 2. Update the delivery
    const { error: updateErr } = await supabase
        .from('deliveries')
        .update({
            quantity: newCount,
            rate_per_piece: newRate,
            updated_at: new Date().toISOString()
        })
        .eq('id', deliveryId)
        .eq('user_id', user.id)

    if (updateErr) return { error: updateErr.message }

    revalidatePath('/')
    return { success: true }
}

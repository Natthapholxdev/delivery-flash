'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changeUserPin(currentPin: string, newPin: string) {
    if (!newPin || newPin.length !== 6) return { error: 'PIN ใหม่ต้องมี 6 หลัก' }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify current PIN by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPin
    })

    if (signInError) return { error: 'PIN ปัจจุบันไม่ถูกต้อง' }

    // Update to new PIN
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPin
    })

    if (updateError) return { error: updateError.message }

    return { success: true }
}

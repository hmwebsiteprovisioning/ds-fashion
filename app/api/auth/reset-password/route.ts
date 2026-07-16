import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { passwordResetSchema } from '@/lib/zodSchemas'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const validationResult = passwordResetSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('❌ Reset password validation failed:', validationResult.error.flatten())
      return NextResponse.json(
        { 
          error: 'Невалиден формат на входните данни',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { token, newPassword } = validationResult.data

    // Find user with valid reset token
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('userid, reset_token, reset_token_expiry')
      .eq('reset_token', token)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Невалиден или изтекъл токен за възстановяване' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (!user.reset_token_expiry) {
      return NextResponse.json(
        { error: 'Невалиден или изтекъл токен за възстановяване' },
        { status: 400 }
      )
    }

    const now = new Date()
    const tokenExpiry = new Date(user.reset_token_expiry)
    
    if (now > tokenExpiry) {
      return NextResponse.json(
        { error: 'Токенът за възстановяване е изтекъл. Моля, заявете нов линк' },
        { status: 400 }
      )
    }

    // Hash the new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password and clear reset token
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('userid', user.userid)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Неуспешна промяна на паролата' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Паролата е променена успешно'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Вътрешна грешка на сървъра' },
      { status: 500 }
    )
  }
}

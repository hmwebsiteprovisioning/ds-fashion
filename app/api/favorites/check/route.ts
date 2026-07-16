import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST - Check if a product is favorited by a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Изискват се потребителско име и идентификатор на продукта' },
        { status: 400 }
      )
    }

    // Check if favorite exists
    const { data: favorite, error: checkError } = await supabaseAdmin
      .from('favorite_products')
      .select('favoriteid')
      .eq('userid', userId)
      .eq('productid', productId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking favorite:', checkError)
      return NextResponse.json(
        { error: 'Неуспешна проверка на статуса на любими' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isFavorited: !!favorite
    })

  } catch (error) {
    console.error('Check favorite API error:', error)
    return NextResponse.json(
      { error: 'Вътрешна грешка на сървъра' },
      { status: 500 }
    )
  }
}

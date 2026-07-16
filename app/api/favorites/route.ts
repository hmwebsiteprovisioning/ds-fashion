import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - Get user's favorite products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Изисква се потребителско име' },
        { status: 400 }
      )
    }

    // Fetch user's favorite products
    const { data: favorites, error: favoritesError } = await supabaseAdmin
      .from('favorite_products')
      .select('favoriteid, productid, createdat')
      .eq('userid', userId)
      .order('createdat', { ascending: false })

    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError)
      return NextResponse.json(
        { error: 'Неуспешно извличане на любимите' },
        { status: 500 }
      )
    }

    // Extract product IDs
    const productIds = favorites?.map(fav => fav.productid) || []

    return NextResponse.json({
      success: true,
      favorites: favorites || [],
      productIds
    })

  } catch (error) {
    console.error('Favorites API error:', error)
    return NextResponse.json(
      { error: 'Вътрешна грешка на сървъра' },
      { status: 500 }
    )
  }
}

// POST - Toggle favorite (add or remove)
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

    // Check if favorite already exists
    const { data: existingFavorite, error: checkError } = await supabaseAdmin
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

    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabaseAdmin
        .from('favorite_products')
        .delete()
        .eq('favoriteid', existingFavorite.favoriteid)

      if (deleteError) {
        console.error('Error removing favorite:', deleteError)
        return NextResponse.json(
          { error: 'Неуспешно премахване от любими' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        isFavorited: false,
        message: 'Премахнато от любими'
      })
    } else {
      // Add favorite
      const { data: newFavorite, error: insertError } = await supabaseAdmin
        .from('favorite_products')
        .insert({
          userid: userId,
          productid: productId
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error adding favorite:', insertError)
        return NextResponse.json(
          { error: 'Неуспешно добавяне в любими' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        isFavorited: true,
        message: 'Добавено в любими',
        favorite: newFavorite
      })
    }

  } catch (error) {
    console.error('Toggle favorite API error:', error)
    return NextResponse.json(
      { error: 'Вътрешна грешка на сървъра' },
      { status: 500 }
    )
  }
}

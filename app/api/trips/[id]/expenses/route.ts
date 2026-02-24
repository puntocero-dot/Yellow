import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || !['admin', 'supervisor'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('trip_expenses')
      .select('*')
      .eq('trip_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ expenses: data || [] })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { category, description, amount } = body

    if (!category || !description || amount === undefined) {
      return NextResponse.json({ error: 'Categoría, descripción y monto son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('trip_expenses')
      .insert({
        trip_id: params.id,
        category,
        description,
        amount: parseFloat(amount),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ expense: data })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('expenseId')

    if (!expenseId) {
      return NextResponse.json({ error: 'expenseId requerido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('trip_expenses')
      .delete()
      .eq('id', expenseId)
      .eq('trip_id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Error al eliminar gasto' }, { status: 500 })
  }
}

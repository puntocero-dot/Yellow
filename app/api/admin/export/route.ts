import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar Sesión y Rol (Solo Administradores)
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Extraer todo: órdenes, viajes, gastos y usuarios
    const [orders, trips, expenses, users] = await Promise.all([
      supabaseAdmin.from('orders').select('*'),
      supabaseAdmin.from('trips').select('*'),
      supabaseAdmin.from('trip_expenses').select('*'),
      supabaseAdmin.from('users').select('*')
    ])

    // Verificar si hubo errores en las consultas
    const errors = [
      orders.error, 
      trips.error, 
      expenses.error, 
      users.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('Export errors:', errors)
      return NextResponse.json({ 
        error: 'Error al extraer datos de la base de datos', 
        details: errors 
      }, { status: 500 })
    }

    // 3. Consolidar en un objeto de respaldo
    const exportData = {
      backup_version: '1.0',
      exported_at: new Date().toISOString(),
      exported_by: session.email,
      data: {
        orders: orders.data || [],
        trips: trips.data || [],
        trip_expenses: expenses.data || [],
        users: users.data || []
      }
    }

    // 4. Retornar el archivo JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="yellow-express-full-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Internal export error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

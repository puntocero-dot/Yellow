import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Vercel Cron Secret or Manual Auth
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 0o401 })
    }

    // 2. Fetch Data to Backup
    const [orders, trips, expenses] = await Promise.all([
      supabaseAdmin.from('orders').select('*'),
      supabaseAdmin.from('trips').select('*'),
      supabaseAdmin.from('trip_expenses').select('*')
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      orders: orders.data || [],
      trips: trips.data || [],
      trip_expenses: expenses.data || []
    }

    // 3. Prepare Filename
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${dateStr}.json`

    // 4. Upload to Supabase Storage
    // We assume the bucket 'backups' exists or we try to create metadata if possible.
    // Note: createBucket is not normally available in the standard client, 
    // but the 'backups' bucket should be pre-configured in the Supabase Dashboard.
    const { error: uploadError } = await supabaseAdmin.storage
      .from('backups')
      .upload(filename, JSON.stringify(backupData, null, 2), {
        contentType: 'application/json',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Backup upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload backup', details: uploadError }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Backup created successfully',
      filename 
    })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

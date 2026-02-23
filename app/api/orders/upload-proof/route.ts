import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    if (!file || !orderId) {
      return NextResponse.json({ error: 'File and orderId required' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${orderId}-${Date.now()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('delivery-proofs')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Error uploading file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('delivery-proofs')
      .getPublicUrl(fileName)

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ delivery_proof_url: publicUrl })
      .eq('id', orderId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

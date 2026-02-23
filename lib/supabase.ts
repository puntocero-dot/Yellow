import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Only create real clients if configured, otherwise create mock clients
const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: [], error: null, single: () => ({ data: null, error: { message: 'Not configured' } }), order: () => ({ data: [], error: null }), eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null } ) }), in: () => ({ data: [], error: null }) }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: { message: 'Not configured' } }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    delete: () => ({ eq: () => ({ error: null }) }),
  }),
  storage: {
    from: () => ({
      upload: () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}) as unknown as SupabaseClient

export const supabase: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

export const supabaseAdmin: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createMockClient()

export type User = {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: 'admin' | 'driver' | 'customer'
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  tracking_number: string
  customer_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  origin_address: string
  destination_address: string
  destination_city: string
  destination_country: string
  package_description: string
  package_weight: number | null
  declared_value: number | null
  shipping_cost: number | null
  status: OrderStatus
  driver_id: string | null
  delivery_proof_url: string | null
  delivery_notes: string | null
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  customer?: User
  driver?: User
}

export type OrderStatus = 
  | 'pending'
  | 'warehouse_la'
  | 'warehouse_sv'
  | 'in_transit_international'
  | 'customs'
  | 'assigned_to_driver'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type StatusHistory = {
  id: string
  order_id: string
  status: OrderStatus
  notes: string | null
  created_by: string | null
  created_at: string
}

export type Notification = {
  id: string
  order_id: string
  type: 'email' | 'whatsapp'
  recipient: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  sent_at: string | null
  created_at: string
}

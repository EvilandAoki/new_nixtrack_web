// Tipos basados en el schema de base de datos (schema_english.md)

// ============= SYSTEM TABLES =============

export interface Role {
  id_role: number
  name: string
  is_admin: 0 | 1
}

export interface Department {
  id_department: number
  code: string
  name: string
  country_code: string
}

export interface City {
  city_id: number
  country_code: string
  department_code: string
  code: string
  name: string
}

export interface Client {
  id_client: number
  company_name: string
  tax_id: string // NIT
  phone: string
  address: string
  email: string
  country_id: string
  city_id: number
  is_active: 0 | 1
  created_at: string
  created_by: number
  updated_at?: string
  updated_by?: number
}

export interface User {
  id: number
  name: string
  email: string
  document_id: string
  password_hash?: string // Not returned from API
  phone: string
  client_id: number
  position: string
  city_code: string
  role_id: number
  is_active: 0 | 1
  created_at: string
  created_by: number
  updated_at?: string
  updated_by?: number
  // Relations (populated by backend)
  client?: Client
  role?: Role
}

// ============= TRACKING TABLES =============

export interface TrackStatus {
  id: number
  name: string
}

export interface Vehicle {
  id: number
  client_id: number
  license_plate: string
  brand: string
  vehicle_type: string
  model_year: string
  color: string
  capacity: string
  container: string
  serial_numbers: string
  is_escort_vehicle: 0 | 1
  is_active: 0 | 1
  created_at: string
  created_by: number
  updated_at?: string
  updated_by?: number
  // Relations
  client?: Client
  files?: VehicleFile[]
}

export interface Agent {
  id: number
  name: string
  document_id: string
  mobile: string
  vehicle_id: number
  is_active: 0 | 1
  created_at: string
  created_by: number
  updated_at?: string
  updated_by?: number
  // Relations
  vehicle?: Vehicle
}

export interface Order {
  id: number
  client_id: number
  vehicle_id: number
  manifest_number: string
  insurance_company: string
  origin_city_code: string
  destination_city_code: string
  route_description: string
  status_level: 'verde' | 'amarillo' | 'rojo' | null // Semáforo
  distance_km: number
  estimated_time: string
  restrictions: string
  tracking_link: string
  notes: string
  created_at: string
  departure_at: string
  arrival_at: string | null
  status_id: number
  driver_name: string
  driver_mobile: string
  order_number: string
  escort_id: number | null
  created_by: number
  updated_at?: string
  updated_by?: number
  is_deleted: 0 | 1
  deleted_by?: number
  deleted_at?: string
  // Relations
  client?: Client
  vehicle?: Vehicle
  escort?: Agent
  status?: TrackStatus
  origin_city?: City
  destination_city?: City
}

export interface OrderDetail {
  id: number
  shipment_id: number // ID del Order (track_order)
  reported_at: string
  reported_by: string
  location_name: string
  sequence_number: 0 | 1 // 0=Con Novedad, 1=Sin Novedad
  notes: string | null
  updated_at?: string
  updated_by?: number
  latitude: number | null
  longitude: number | null
  is_deleted: 0 | 1
  // Relations
  order?: Order
}

// ============= FILE TABLES =============

export interface VehicleFile {
  id: number
  vehicle_id: number
  file_name: string
  description: string
  file_url: string
  mime_type: string
  is_main_photo: 0 | 1
  created_by: number
  created_at: string
  is_deleted: 0 | 1
}

export interface OrderFile {
  id: number
  shipment_id: number
  file_name: string
  description: string
  file_url: string
  mime_type: string
  created_by: number
  created_at: string
  is_deleted: 0 | 1
}

export interface OrderDetailFile {
  id: number
  checkpoint_id: number
  file_name: string
  description: string
  file_url: string
  mime_type: string
  created_by: number
  created_at: string
  is_deleted: 0 | 1
}

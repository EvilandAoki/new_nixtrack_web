// Tipos para formularios

import type { User, Client, Vehicle, Agent, Order, OrderDetail } from './entities'

// Omit password_hash y campos autogenerados
export type UserFormData = Omit<
  User,
  'id' | 'password_hash' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'client' | 'role'
> & {
  password?: string // Solo para creación
}

export type ClientFormData = Omit<
  Client,
  'id_client' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'
>

export type VehicleFormData = Omit<
  Vehicle,
  'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'client'
>

export type AgentFormData = Omit<
  Agent,
  'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by' | 'vehicle'
>

export type OrderFormData = Omit<
  Order,
  | 'id'
  | 'created_at'
  | 'created_by'
  | 'updated_at'
  | 'updated_by'
  | 'is_deleted'
  | 'deleted_by'
  | 'deleted_at'
  | 'status_level'
  | 'client'
  | 'vehicle'
  | 'escort'
  | 'status'
  | 'origin_city'
  | 'destination_city'
>

export type OrderDetailFormData = Omit<
  OrderDetail,
  'id' | 'updated_at' | 'updated_by' | 'is_deleted' | 'order'
> & {
  files?: File[] // Para upload de archivos
}

// Validaciones
export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export type ValidationRules<T> = {
  [K in keyof T]?: FieldValidation
}

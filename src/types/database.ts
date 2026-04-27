export interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  min_quantity: number;
  type: string;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  created_at: string;
}

export interface Movement {
  id: string;
  product_id: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  notes: string;
  created_at: string;
}

export interface CustomType {
  id: string;
  name: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  details: string;
  record_id: string;
  user_email: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

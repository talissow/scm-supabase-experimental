import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getMovements() {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getCustomTypes() {
  const { data, error } = await supabase
    .from('custom_types')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getAuditLog() {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  return data;
}

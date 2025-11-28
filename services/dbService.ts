import { supabase } from './supabase';
import { User, UserRole, Customer } from '../types';

export const dbService = {
  // --- AUTH / USERS ---
  
  async authenticate(email: string, password: string): Promise<User | null> {
    // In a real production app, use supabase.auth.signInWithPassword
    // For this MVP with custom user table management:
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password) // Note: In production, verify hash, don't store plain text
      .eq('active', true)
      .single();

    if (error || !data) return null;
    return data as User;
  },

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async upsertUser(user: Partial<User>): Promise<User | null> {
    const { id, ...rest } = user;
    // If id exists and is valid uuid, update. Else create new.
    
    const payload = { ...rest };
    
    if (id && id.length > 10) { 
       const { data, error } = await supabase.from('users').update(payload).eq('id', id).select().single();
       if (error) throw error;
       return data;
    } else {
       const { data, error } = await supabase.from('users').insert([payload]).select().single();
       if (error) throw error;
       return data;
    }
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  // --- ROLES ---

  async getRoles(): Promise<UserRole[]> {
    const { data, error } = await supabase.from('roles').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async upsertRole(role: Partial<UserRole>): Promise<UserRole | null> {
    const { id, ...rest } = role;
    if (id && id.length > 10) {
      const { data, error } = await supabase.from('roles').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('roles').insert([rest]).select().single();
      if (error) throw error;
      return data;
    }
  },

  async deleteRole(id: string): Promise<void> {
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SETTINGS (Shopify Config) ---

  async getShopifyConfig() {
    const { data } = await supabase.from('settings').select('value').eq('key', 'shopify_config').single();
    return data?.value || { shopUrl: '', accessToken: '', connected: false };
  },

  async saveShopifyConfig(config: any) {
    const { error } = await supabase.from('settings').upsert({ key: 'shopify_config', value: config });
    if (error) throw error;
  },

  // --- CUSTOMERS ---

  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (error) throw error;
    
    // Map DB columns to Frontend Interface
    // The DB has 'shopify_id', but the frontend Customer type expects 'code'
    return (data || []).map((row: any) => ({
      ...row,
      code: row.shopify_id // Mapping here ensures the table shows the ID correctly
    })) as Customer[];
  },

  async syncCustomers(customers: any[]): Promise<void> {
    // Upsert multiple customers
    const formattedData = customers.map(c => ({
      shopify_id: c.id.toString(), // DB Column is shopify_id
      // We DO NOT send 'code' here because the column does not exist in the DB table 'customers'
      name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email,
      email: c.email,
      phone: c.phone,
      city: c.default_address?.city || '',
      country: c.default_address?.country || '',
      active: true,
      updated_at: new Date().toISOString()
    }));

    // Perform upsert based on shopify_id
    const { error } = await supabase.from('customers').upsert(formattedData, { onConflict: 'shopify_id' });
    if (error) throw error;
  }
};
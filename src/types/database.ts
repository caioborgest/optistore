
// Database types that match the actual Supabase schema
export interface Company {
  id: string;
  name: string;
  email: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  phone?: string;
  address?: string;
  invite_code?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  company_id: string; // Make this required to match authService expectations
  role: 'admin' | 'manager' | 'employee';
  sector: string;
  is_active: boolean;
  is_company_admin: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sector: string;
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  completed_at?: string;
  is_recurring?: boolean;
  recurrence_pattern?: any;
  created_at: string;
  updated_at: string;
}

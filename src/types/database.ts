
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
  company_id?: string;
  role: 'admin' | 'manager' | 'employee';
  sector?: string;
  is_active: boolean;
  is_company_admin: boolean;
  phone?: string;
  last_login?: string;
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
  estimated_hours?: number;
  actual_hours?: number;
  parent_task_id?: string;
  tags?: string[];
  location?: string;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'channel';
  description?: string;
  avatar_url?: string;
  created_by?: string;
  is_active: boolean;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  reply_to?: string;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  sender?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_completed' | 'task_overdue' | 'message' | 'system';
  title: string;
  content?: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  created_at: string;
}

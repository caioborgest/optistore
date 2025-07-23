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
  invite_code: string; // Required in database
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: 'gerente' | 'supervisor' | 'colaborador';
  sector?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_company_admin: boolean;
  company_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  company_id: string;
  estimated_hours?: number;
  actual_hours?: number;
  completed_at?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  parent_task_id?: string;
  attachments?: string[];
  sector?: string;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'sector' | 'task';
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

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}


import { supabase } from '@/integrations/supabase/client';
import { UploadService } from './uploadService';

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

export class TaskAttachmentService {
  /**
   * Adicionar anexo à tarefa
   */
  static async addAttachment(
    taskId: string,
    file: File
  ): Promise<{ data: TaskAttachment | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: { message: 'Usuário não autenticado' } };
      }

      // Validar arquivo
      const validation = UploadService.validateFile(file);
      if (!validation.isValid) {
        return { data: null, error: { message: validation.error } };
      }

      // Gerar nome único
      const uniqueName = UploadService.generateUniqueFileName(file.name);
      const filePath = `tasks/${taskId}/${uniqueName}`;

      // Fazer upload
      const { data: uploadData, error: uploadError } = await UploadService.uploadFile(
        file,
        'task-attachments',
        filePath
      );

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      // Obter URL pública
      const publicUrl = UploadService.getPublicUrl('task-attachments', filePath);

      // Salvar no banco
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao adicionar anexo:', error);
      return { data: null, error };
    }
  }

  /**
   * Listar anexos de uma tarefa
   */
  static async getTaskAttachments(taskId: string): Promise<{ data: TaskAttachment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select(`
          *,
          uploaded_user:users!task_attachments_uploaded_by_fkey(name, email)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar anexos:', error);
      return { data: null, error };
    }
  }

  /**
   * Deletar anexo
   */
  static async deleteAttachment(attachmentId: string): Promise<{ error: any }> {
    try {
      // Buscar anexo para obter URL
      const { data: attachment, error: fetchError } = await supabase
        .from('task_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();

      if (fetchError) {
        return { error: fetchError };
      }

      // Extrair path do arquivo da URL
      const url = new URL(attachment.file_url);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments.slice(pathSegments.indexOf('task-attachments') + 1).join('/');

      // Deletar arquivo do storage
      await UploadService.deleteFile('task-attachments', filePath);

      // Deletar registro do banco
      const { error } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      return { error };
    }
  }
}

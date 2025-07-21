
import { supabase } from '@/integrations/supabase/client';

export class UploadService {
  /**
   * Upload de arquivo para o bucket
   */
  static async uploadFile(file: File, bucket: string, path: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      return { data, error };
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return { data: null, error };
    }
  }

  /**
   * Obter URL pública do arquivo
   */
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Deletar arquivo
   */
  static async deleteFile(bucket: string, path: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      return { error };
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return { error };
    }
  }

  /**
   * Listar arquivos de um diretório
   */
  static async listFiles(bucket: string, path: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);

      return { data, error };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return { data: null, error };
    }
  }

  /**
   * Validar arquivo
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'Arquivo muito grande. Máximo 10MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de arquivo não permitido.' };
    }

    return { isValid: true };
  }

  /**
   * Gerar nome único para arquivo
   */
  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    
    return `${nameWithoutExt}_${timestamp}_${randomStr}.${extension}`;
  }
}

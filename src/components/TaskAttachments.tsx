
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Download, Trash2, File, Image, FileText, AlertCircle } from 'lucide-react';
import { TaskAttachmentService, TaskAttachment } from '@/services/taskAttachmentService';
import { useToast } from '@/hooks/use-toast';
import FileUpload from './FileUpload';

interface TaskAttachmentsProps {
  taskId: string;
  canEdit?: boolean;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId, canEdit = true }) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const { data, error } = await TaskAttachmentService.getTaskAttachments(taskId);
      
      if (error) {
        toast({
          title: 'Erro ao carregar anexos',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setAttachments(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar anexos',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const { data, error } = await TaskAttachmentService.addAttachment(taskId, file);
      
      if (error) {
        toast({
          title: 'Erro ao adicionar anexo',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setAttachments([data, ...attachments]);
      toast({
        title: 'Anexo adicionado',
        description: 'Arquivo enviado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao adicionar anexo',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const { error } = await TaskAttachmentService.deleteAttachment(attachmentId);
      
      if (error) {
        toast({
          title: 'Erro ao deletar anexo',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setAttachments(attachments.filter(att => att.id !== attachmentId));
      toast({
        title: 'Anexo deletado',
        description: 'Arquivo removido com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro ao deletar anexo',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive'
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Anexos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Anexos ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <FileUpload
            onUpload={handleFileUpload}
            className="mb-4"
          />
        )}

        {attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Paperclip className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum anexo encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(attachment.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{attachment.file_name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{formatFileSize(attachment.file_size)}</span>
                      <span>•</span>
                      <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskAttachments;

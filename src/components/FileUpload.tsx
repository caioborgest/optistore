
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { UploadService } from '@/services/uploadService';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      for (const file of acceptedFiles) {
        const validation = UploadService.validateFile(file);
        if (!validation.isValid) {
          setError(validation.error || 'Arquivo inválido');
          setUploading(false);
          return;
        }

        await onUpload(file);
        setUploadProgress(100);
      }
    } catch (err) {
      setError('Erro ao fazer upload do arquivo');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple,
    maxSize,
    disabled: disabled || uploading
  });

  return (
    <div className={className}>
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <CardContent className="p-6">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Enviando arquivo...</p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Suporte para imagens, PDF, DOC, XLS, TXT (máx. 10MB)
                  </p>
                </div>
                <Button variant="outline" disabled={disabled}>
                  <File className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

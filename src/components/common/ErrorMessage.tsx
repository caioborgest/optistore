
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="ml-2 underline hover:no-underline"
          >
            Tentar novamente
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

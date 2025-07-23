import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Construction, 
  Sparkles, 
  ArrowLeft, 
  Clock,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnderDevelopmentProps {
  title: string;
  description: string;
  features?: string[];
  estimatedCompletion?: string;
  showBackButton?: boolean;
}

export const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  title,
  description,
  features = [],
  estimatedCompletion = "Em breve",
  showBackButton = true
}) => {
  const navigate = useNavigate();

  const defaultFeatures = [
    "Interface moderna e intuitiva",
    "Integração com sistema existente", 
    "Funcionalidades avançadas",
    "Otimização para mobile",
    "Sincronização em tempo real"
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 animate-pulse">
            <Construction className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">{description}</p>
        </div>

        {/* Status Card */}
        <Card className="border-2 border-dashed border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                Em Desenvolvimento
              </Badge>
            </div>
            <CardTitle className="text-2xl">Funcionalidade em Construção</CardTitle>
            <CardDescription className="text-base">
              Nossa equipe está trabalhando para trazer esta funcionalidade incrível para você
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline */}
            <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Previsão: {estimatedCompletion}</span>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Funcionalidades Planejadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progresso do Desenvolvimento</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out w-3/4" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Zap className="h-4 w-4" />
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Tem sugestões para esta funcionalidade? Entre em contato conosco!
          </p>
        </div>
      </div>
    </div>
  );
};
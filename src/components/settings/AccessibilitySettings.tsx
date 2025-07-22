import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useA11y } from '@/hooks/useA11y';
import { 
  Eye, 
  Zap, 
  MousePointer, 
  Volume2, 
  RotateCcw, 
  Focus,
  Keyboard,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AccessibilitySettings: React.FC = () => {
  const { options, setOption, resetOptions, announceToScreenReader } = useA11y();

  const accessibilityOptions = [
    {
      key: 'reduceMotion' as const,
      title: 'Reduzir Movimento',
      description: 'Minimiza animações e transições para reduzir desconforto',
      icon: Zap,
      color: 'blue',
      impact: 'Alto impacto para pessoas com sensibilidade a movimento'
    },
    {
      key: 'highContrast' as const,
      title: 'Alto Contraste',
      description: 'Aumenta o contraste para melhor legibilidade',
      icon: Eye,
      color: 'purple',
      impact: 'Essencial para pessoas com baixa visão'
    },
    {
      key: 'largeText' as const,
      title: 'Texto Grande',
      description: 'Aumenta o tamanho do texto em toda a aplicação',
      icon: MousePointer,
      color: 'green',
      impact: 'Melhora a legibilidade para pessoas com dificuldades visuais'
    },
    {
      key: 'screenReader' as const,
      title: 'Leitor de Tela',
      description: 'Otimiza a interface para leitores de tela',
      icon: Volume2,
      color: 'orange',
      impact: 'Fundamental para pessoas cegas ou com baixa visão'
    },
    {
      key: 'focusVisible' as const,
      title: 'Foco Visível Aprimorado',
      description: 'Melhora a visibilidade do foco para navegação por teclado',
      icon: Focus,
      color: 'indigo',
      impact: 'Importante para navegação por teclado'
    },
    {
      key: 'keyboardNavigation' as const,
      title: 'Navegação por Teclado',
      description: 'Otimiza a navegação usando apenas o teclado',
      icon: Keyboard,
      color: 'pink',
      impact: 'Essencial para pessoas com limitações motoras'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleOptionChange = (option: keyof typeof options, value: boolean) => {
    setOption(option, value);
    announceToScreenReader(
      `${accessibilityOptions.find(opt => opt.key === option)?.title} ${value ? 'ativado' : 'desativado'}`
    );
  };

  const activeOptionsCount = Object.values(options).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Configurações de Acessibilidade
        </CardTitle>
        <CardDescription>
          Personalize a experiência para melhorar a acessibilidade
        </CardDescription>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>{activeOptionsCount} de {accessibilityOptions.length} opções ativas</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {accessibilityOptions.map((option) => {
            const Icon = option.icon;
            const isActive = options[option.key];
            
            return (
              <motion.div
                key={option.key}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${isActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/30'
                  }
                `}
                whileHover={{ scale: 1.01 }}
                layout
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg border ${getColorClasses(option.color)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label 
                          htmlFor={option.key} 
                          className="font-medium cursor-pointer"
                        >
                          {option.title}
                        </Label>
                        {isActive && (
                          <motion.span
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            Ativo
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {option.description}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        {option.impact}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={option.key}
                    checked={isActive}
                    onCheckedChange={(checked) => handleOptionChange(option.key, checked)}
                    aria-describedby={`${option.key}-description`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">Ações Rápidas</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Enable essential accessibility options
                setOption('focusVisible', true);
                setOption('keyboardNavigation', true);
                setOption('screenReader', true);
                announceToScreenReader('Configurações essenciais de acessibilidade ativadas');
              }}
            >
              Ativar Essenciais
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Enable visual accessibility options
                setOption('highContrast', true);
                setOption('largeText', true);
                setOption('focusVisible', true);
                announceToScreenReader('Configurações visuais de acessibilidade ativadas');
              }}
            >
              Melhorar Visibilidade
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Enable motion-sensitive options
                setOption('reduceMotion', true);
                announceToScreenReader('Redução de movimento ativada');
              }}
            >
              Reduzir Movimento
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              resetOptions();
              announceToScreenReader('Configurações de acessibilidade restauradas para o padrão');
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrões
          </Button>
        </div>

        {/* Accessibility Info */}
        <div className="pt-4 border-t">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Sobre Acessibilidade
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Estas configurações seguem as diretrizes WCAG 2.1 AA para garantir que a aplicação 
              seja acessível para pessoas com diferentes necessidades.
            </p>
            <p className="text-sm text-muted-foreground">
              Para mais informações sobre acessibilidade, visite nossa documentação ou entre em 
              contato com o suporte.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
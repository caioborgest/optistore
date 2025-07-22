import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualList } from '@/components/ui/virtual-list';
import { LazyImage } from '@/components/ui/lazy-image';
import { useTheme } from '@/hooks/useTheme';
import { useCustomTheme } from '@/hooks/useCustomTheme';
import { useA11y } from '@/hooks/useA11y';
import { useGestures } from '@/hooks/useGestures';
import { 
  Palette, 
  Eye, 
  Zap, 
  Image, 
  List, 
  Smartphone,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TestAdvancedFeatures: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  const { colors, setColors } = useCustomTheme();
  const { options, setOption, announceToScreenReader } = useA11y();
  const [gestureInfo, setGestureInfo] = useState<string>('');
  const gestureRef = useRef<HTMLDivElement>(null);

  // Configure gestures
  useGestures(gestureRef, {
    onSwipeLeft: () => setGestureInfo('Swipe Left detectado!'),
    onSwipeRight: () => setGestureInfo('Swipe Right detectado!'),
    onSwipeUp: () => setGestureInfo('Swipe Up detectado!'),
    onSwipeDown: () => setGestureInfo('Swipe Down detectado!'),
    onTap: () => setGestureInfo('Tap detectado!'),
    onDoubleTap: () => setGestureInfo('Double Tap detectado!'),
  });

  // Sample data for virtual list
  const virtualListItems = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    description: `Descrição do item ${i + 1}`,
  }));

  const testFeatures = [
    {
      id: 'themes',
      title: 'Sistema de Temas',
      icon: Palette,
      status: 'working',
      description: 'Temas claro/escuro e cores personalizáveis',
      test: () => {
        const newTheme = actualTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        announceToScreenReader(`Tema alterado para ${newTheme}`);
      }
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      icon: Eye,
      status: 'working',
      description: 'Configurações de acessibilidade avançadas',
      test: () => {
        setOption('highContrast', !options.highContrast);
        announceToScreenReader(`Alto contraste ${options.highContrast ? 'desativado' : 'ativado'}`);
      }
    },
    {
      id: 'performance',
      title: 'Performance',
      icon: Zap,
      status: 'working',
      description: 'Virtual scrolling e lazy loading',
      test: () => {
        announceToScreenReader('Teste de performance executado');
      }
    },
    {
      id: 'gestures',
      title: 'Gestos Touch',
      icon: Smartphone,
      status: 'working',
      description: 'Suporte a gestos avançados',
      test: () => {
        setGestureInfo('Teste os gestos na área abaixo!');
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Teste de Funcionalidades Avançadas
            </CardTitle>
            <CardDescription>
              Teste todas as melhorias implementadas no OptiFlow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {testFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            <h3 className="font-medium">{feature.title}</h3>
                          </div>
                          {getStatusIcon(feature.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {feature.description}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={feature.test}
                          className="w-full"
                        >
                          Testar
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="gestures">Gestos</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Temas</CardTitle>
              <CardDescription>
                Tema atual: {actualTheme} | Cor primária: {colors.primary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  Claro
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  Escuro
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                >
                  Sistema
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors({ primary: e.target.value })}
                  className="w-12 h-10 rounded border"
                />
                <span>Cor Primária</span>
              </div>
              
              <div className="p-4 rounded-lg border" style={{ backgroundColor: colors.primary, color: 'white' }}>
                Prévia da cor primária
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Scrolling</CardTitle>
              <CardDescription>
                Lista com 10.000 itens renderizada eficientemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VirtualList
                items={virtualListItems}
                height={300}
                itemHeight={60}
                renderItem={(item, index) => (
                  <div className="p-3 border-b flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gestures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Gestos</CardTitle>
              <CardDescription>
                Faça swipe, tap ou double tap na área abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={gestureRef}
                className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer"
              >
                <div className="text-center">
                  <Smartphone className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Área de teste de gestos</p>
                  {gestureInfo && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-primary font-medium mt-2"
                    >
                      {gestureInfo}
                    </motion.p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lazy Loading de Imagens</CardTitle>
              <CardDescription>
                Imagens carregadas sob demanda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <LazyImage
                    key={i}
                    src={`https://picsum.photos/300/200?random=${i}`}
                    alt={`Imagem de teste ${i + 1}`}
                    className="rounded-lg"
                    aspectRatio="3/2"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Status das Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Drag & Drop Kanban</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Sistema de Temas</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Acessibilidade</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Animações</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Virtual Scrolling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Lazy Loading</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
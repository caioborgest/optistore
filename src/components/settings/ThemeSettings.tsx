import React, { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useCustomTheme } from "@/hooks/useCustomTheme";
import { Moon, Sun, Monitor, Palette, RotateCcw, Check } from "lucide-react";
import { motion } from "framer-motion";

export const ThemeSettings: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  const { colors, setColors, resetColors } = useCustomTheme();
  const primarySwatchRef = useRef<HTMLDivElement>(null);
  const successSwatchRef = useRef<HTMLDivElement>(null);
  const presetRefs = useRef<(HTMLDivElement | null)[]>([]);

  const themeOptions = [
    {
      value: "light",
      label: "Claro",
      icon: Sun,
      description: "Tema claro sempre ativo",
    },
    {
      value: "dark",
      label: "Escuro",
      icon: Moon,
      description: "Tema escuro sempre ativo",
    },
    {
      value: "system",
      label: "Sistema",
      icon: Monitor,
      description: "Segue a preferência do sistema",
    },
  ];

  const colorPresets = [
    { name: "Azul Padrão", primary: "#3b82f6", success: "#00bf63" },
    { name: "Verde Natureza", primary: "#059669", success: "#10b981" },
    { name: "Roxo Criativo", primary: "#7c3aed", success: "#00bf63" },
    { name: "Rosa Moderno", primary: "#ec4899", success: "#00bf63" },
    { name: "Laranja Energia", primary: "#ea580c", success: "#00bf63" },
  ];

  // Apply dynamic styles using refs
  useEffect(() => {
    if (primarySwatchRef.current) {
      primarySwatchRef.current.style.setProperty(
        "--swatch-color",
        colors.primary
      );
    }
    if (successSwatchRef.current) {
      successSwatchRef.current.style.setProperty(
        "--swatch-color",
        colors.success
      );
    }

    // Apply styles to preset color swatches
    presetRefs.current.forEach((ref, index) => {
      if (ref) {
        const preset = colorPresets[index];
        const primaryDot = ref.querySelector(".preset-primary") as HTMLElement;
        const successDot = ref.querySelector(".preset-success") as HTMLElement;
        if (primaryDot) primaryDot.style.backgroundColor = preset.primary;
        if (successDot) successDot.style.backgroundColor = preset.success;
      }
    });
  }, [colors.primary, colors.success, colorPresets]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Configurações de Tema
          </CardTitle>
          <CardDescription>
            Personalize a aparência da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Modo de Tema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setTheme(option.value as any)}
                    className={`
                      relative p-4 rounded-lg border-2 text-left transition-all duration-200
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Tema atual:{" "}
              <span className="font-medium capitalize">{actualTheme}</span>
            </div>
          </div>

          {/* Custom Colors */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Cores Personalizadas</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="primary-color" className="block mb-2">
                  Cor Primária
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={colors.primary}
                    onChange={(e) => setColors({ primary: e.target.value })}
                    className="w-12 h-10 rounded-md border border-input cursor-pointer"
                    aria-label="Seletor de cor primária"
                    title="Selecione a cor primária da interface"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {colors.primary.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cor principal da interface
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="success-color" className="block mb-2">
                  Cor de Sucesso
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="success-color"
                    value={colors.success}
                    onChange={(e) => setColors({ success: e.target.value })}
                    className="w-12 h-10 rounded-md border border-input cursor-pointer"
                    aria-label="Seletor de cor de sucesso"
                    title="Selecione a cor para ações positivas"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {colors.success.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cor para ações positivas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <Label className="block mb-2">Presets de Cores</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <motion.button
                    key={preset.name}
                    onClick={() =>
                      setColors({
                        primary: preset.primary,
                        success: preset.success,
                      })
                    }
                    className="flex items-center gap-2 p-2 rounded-md border border-input hover:bg-accent transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="flex gap-1"
                      ref={(el) =>
                        (presetRefs.current[colorPresets.indexOf(preset)] = el)
                      }
                    >
                      <div className="w-4 h-4 rounded-full border preset-primary" />
                      <div className="w-4 h-4 rounded-full border preset-success" />
                    </div>
                    <span className="text-sm">{preset.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">Prévia</h3>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3 mb-3">
                <div
                  ref={primarySwatchRef}
                  className="w-8 h-8 rounded-full color-swatch"
                />
                <div>
                  <div className="font-medium">Elemento Primário</div>
                  <div className="text-sm text-muted-foreground">
                    Cor principal da interface
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  ref={successSwatchRef}
                  className="w-8 h-8 rounded-full color-swatch"
                />
                <div>
                  <div className="font-medium">Elemento de Sucesso</div>
                  <div className="text-sm text-muted-foreground">
                    Cor para ações positivas
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetColors}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Cores Padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Construction,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

interface DevelopmentStatusProps {
  title: string;
  description: string;
  features: string[];
  status?: "development" | "coming-soon" | "beta";
  onGetStarted?: () => void;
}

export const DevelopmentStatus: React.FC<DevelopmentStatusProps> = ({
  title,
  description,
  features,
  status = "development",
  onGetStarted,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "coming-soon":
        return {
          icon: Clock,
          color: "#f59e0b",
          bgColor: "rgba(245, 158, 11, 0.1)",
          borderColor: "rgba(245, 158, 11, 0.3)",
          label: "Em Breve",
          textColor: "#92400e",
        };
      case "beta":
        return {
          icon: Zap,
          color: "#8b5cf6",
          bgColor: "rgba(139, 92, 246, 0.1)",
          borderColor: "rgba(139, 92, 246, 0.3)",
          label: "Beta",
          textColor: "#6b21a8",
        };
      default:
        return {
          icon: Construction,
          color: "#00bf63",
          bgColor: "rgba(0, 191, 99, 0.1)",
          borderColor: "rgba(0, 191, 99, 0.3)",
          label: "Em Desenvolvimento",
          textColor: "#00632b",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Status Card */}
      <Card className="modern-card animate-fade-scale max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            {/* Status Icon */}
            <div
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 animate-pulse status-indicator"
              style={{ '--status-color': config.bgColor } as React.CSSProperties}
            >
              <IconComponent
                className="h-8 w-8"
                style={{ color: config.color } as React.CSSProperties}
              />
            </div>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className="mb-4 text-sm px-4 py-2"
              style={{
                borderColor: config.borderColor,
                backgroundColor: config.bgColor,
                color: config.textColor,
              }}
            >
              <Sparkles className="h-3 w-3 mr-2" />
              {config.label}
            </Badge>

            {/* Title and Description */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Funcionalidade em Construção
            </h3>
            <p className="text-gray-600 mb-8">
              Estamos trabalhando para trazer esta funcionalidade incrível para
              você. Fique atento às próximas atualizações!
            </p>

            {/* Features List */}
            <div
              className="border rounded-xl p-6 mb-8"
              style={{
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
              }}
            >
              <h4
                className="font-semibold mb-4 flex items-center justify-center gap-2"
                style={{ color: config.textColor }}
              >
                <CheckCircle className="h-4 w-4" />
                Funcionalidades Planejadas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm animate-slide-right"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      color: config.textColor,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {onGetStarted && (
              <Button
                onClick={onGetStarted}
                className="hover-lift"
                style={{
                  background: `linear-gradient(135deg, ${config.color} 0%, ${config.textColor} 100%)`,
                  color: "white",
                }}
              >
                Começar Agora
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Progresso</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000 ease-out progress-fill"
                  style={{
                    width: "75%",
                    background: `linear-gradient(135deg, ${config.color} 0%, ${config.textColor} 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div
        className="text-center text-sm text-gray-500 animate-slide-up"
        style={{ animationDelay: "400ms" }}
      >
        <p>
          Tem sugestões ou feedback? Entre em contato conosco para ajudar a
          moldar esta funcionalidade!
        </p>
      </div>
    </div>
  );
};

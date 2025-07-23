import React, { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  const statusIconRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const featuresContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  // Apply dynamic styles using refs
  useEffect(() => {
    if (statusIconRef.current) {
      statusIconRef.current.style.setProperty('--status-color', config.bgColor);
    }
    if (badgeRef.current) {
      badgeRef.current.style.borderColor = config.borderColor;
      badgeRef.current.style.backgroundColor = config.bgColor;
      badgeRef.current.style.color = config.textColor;
    }
    if (featuresContainerRef.current) {
      featuresContainerRef.current.style.backgroundColor = config.bgColor;
      featuresContainerRef.current.style.borderColor = config.borderColor;
    }
    if (titleRef.current) {
      titleRef.current.style.color = config.textColor;
    }
    if (buttonRef.current) {
      buttonRef.current.style.background = `linear-gradient(135deg, ${config.color} 0%, ${config.textColor} 100%)`;
      buttonRef.current.style.color = 'white';
    }
    if (progressRef.current) {
      progressRef.current.style.background = `linear-gradient(135deg, ${config.color} 0%, ${config.textColor} 100%)`;
    }
    
    // Apply styles to feature items
    featureRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.style.color = config.textColor;
        const dot = ref.querySelector('.feature-dot') as HTMLElement;
        if (dot) {
          dot.style.backgroundColor = config.color;
        }
      }
    });
  }, [config]);

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
              ref={statusIconRef}
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 animate-pulse status-indicator"
            >
              <IconComponent className="h-8 w-8" />
            </div>

            {/* Status Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold mb-4"
            >
              <Sparkles className="h-3 w-3 mr-2" />
              {config.label}
            </div>

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
              ref={featuresContainerRef}
              className="border rounded-xl p-6 mb-8"
            >
              <h4
                ref={titleRef}
                className="font-semibold mb-4 flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Funcionalidades Planejadas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    ref={(el) => (featureRefs.current[index] = el)}
                    className={`flex items-center gap-2 text-sm animate-slide-right animation-delay-${Math.min(index * 100, 500)}`}
                  >
                    <div className="w-2 h-2 rounded-full feature-dot" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {onGetStarted && (
              <button
                ref={buttonRef}
                onClick={onGetStarted}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover-lift"
              >
                Começar Agora
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}

            {/* Progress Indicator */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Progresso</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  ref={progressRef}
                  className="h-2 rounded-full transition-all duration-1000 ease-out progress-fill w-3/4"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-500 animate-slide-up animation-delay-400">
        <p>
          Tem sugestões ou feedback? Entre em contato conosco para ajudar a
          moldar esta funcionalidade!
        </p>
      </div>
    </div>
  );
};

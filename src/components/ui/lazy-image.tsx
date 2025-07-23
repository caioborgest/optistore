import React, { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { useA11y } from "@/hooks/useA11y";

interface LazyImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  blur?: boolean;
  aspectRatio?: string;
}

const defaultPlaceholder =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG8uLi48L3RleHQ+PC9zdmc+";

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc = defaultPlaceholder,
  threshold = 0.1,
  fallbackSrc,
  onLoad,
  onError,
  blur = true,
  aspectRatio,
  className = "",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const { options } = useA11y();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "50px", // Start loading 50px before the image comes into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setIsLoaded(true);
      }
      onError?.();
    };

    img.src = src;
  }, [isInView, src, fallbackSrc, onLoad, onError]);

  const imageVariants = {
    loading: {
      opacity: 0,
      scale: 1.1,
      filter: blur ? "blur(10px)" : "none",
    },
    loaded: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
  };

  const transition = {
    duration: options.reduceMotion ? 0.01 : 0.6,
    ease: [0.25, 0.1, 0.25, 1] as const, // easeOut cubic-bezier
  };

  return (
    <div
      className={`lazy-image-container relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <motion.img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover"
        variants={imageVariants}
        initial="loading"
        animate={isLoaded ? "loaded" : "loading"}
        transition={transition}
        loading="lazy"
        decoding="async"
        {...props}
      />

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <motion.div
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: options.reduceMotion ? 0 : 1,
              repeat: options.reduceMotion ? 0 : Infinity,
              ease: [0, 0, 1, 1] as const, // linear
            }}
          />
        </div>
      )}

      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm">Erro ao carregar imagem</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Progressive image loading component
export const ProgressiveImage: React.FC<{
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  className?: string;
}> = ({ lowQualitySrc, highQualitySrc, alt, className = "" }) => {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);
  const { options } = useA11y();

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHighQualityLoaded(true);
    img.src = highQualitySrc;
  }, [highQualitySrc]);

  return (
    <div className={`progressive-image-container relative ${className}`}>
      <motion.img
        src={lowQualitySrc}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ opacity: 1 }}
        animate={{ opacity: highQualityLoaded ? 0 : 1 }}
        transition={{ duration: options.reduceMotion ? 0.01 : 0.3 }}
      />
      <motion.img
        src={highQualitySrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: highQualityLoaded ? 1 : 0 }}
        transition={{ duration: options.reduceMotion ? 0.01 : 0.3 }}
      />
    </div>
  );
};

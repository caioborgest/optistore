import { useEffect, useRef, RefObject } from 'react';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
  velocity?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useGestures(
  ref: RefObject<HTMLElement>,
  options: GestureOptions
) {
  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);
  const lastTap = useRef<number>(0);
  const initialDistance = useRef<number>(0);
  
  const threshold = options.threshold || 50;
  const velocityThreshold = options.velocity || 0.3;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const getTouchPoint = (e: TouchEvent): TouchPoint => ({
      x: e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0,
      y: e.touches[0]?.clientY || e.changedTouches[0]?.clientY || 0,
      time: Date.now(),
    });

    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = getTouchPoint(e);
      
      // Handle pinch start
      if (e.touches.length === 2 && options.onPinch) {
        initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;

      // Handle pinch
      if (e.touches.length === 2 && options.onPinch && initialDistance.current > 0) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance.current;
        options.onPinch(scale);
        return;
      }

      touchEnd.current = getTouchPoint(e);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || !touchEnd.current) {
        // Handle tap
        if (touchStart.current && options.onTap) {
          const now = Date.now();
          const timeDiff = now - lastTap.current;
          
          if (timeDiff < 300 && options.onDoubleTap) {
            options.onDoubleTap();
            lastTap.current = 0;
          } else {
            options.onTap();
            lastTap.current = now;
          }
        }
        return;
      }

      const distX = touchEnd.current.x - touchStart.current.x;
      const distY = touchEnd.current.y - touchStart.current.y;
      const timeDiff = touchEnd.current.time - touchStart.current.time;
      
      const absDistX = Math.abs(distX);
      const absDistY = Math.abs(distY);
      const velocity = Math.max(absDistX, absDistY) / timeDiff;

      // Check if gesture meets threshold and velocity requirements
      if (Math.max(absDistX, absDistY) > threshold && velocity > velocityThreshold) {
        if (absDistX > absDistY) {
          // Horizontal swipe
          if (distX > 0) {
            options.onSwipeRight?.();
          } else {
            options.onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (distY > 0) {
            options.onSwipeDown?.();
          } else {
            options.onSwipeUp?.();
          }
        }
      }

      // Reset
      touchStart.current = null;
      touchEnd.current = null;
      initialDistance.current = 0;
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, options, threshold, velocityThreshold]);
}

// Hook for keyboard gestures
export function useKeyboardGestures(options: {
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'Enter':
          options.onEnter?.();
          break;
        case 'Escape':
          options.onEscape?.();
          break;
        case ' ':
          e.preventDefault();
          options.onSpace?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}
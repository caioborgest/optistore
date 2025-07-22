import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useA11y } from '@/hooks/useA11y';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const reducedMotionTransition = {
  duration: 0.01,
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { options } = useA11y();

  const variants = options.reduceMotion ? reducedMotionVariants : pageVariants;
  const transition = options.reduceMotion ? reducedMotionTransition : pageTransition;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={transition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
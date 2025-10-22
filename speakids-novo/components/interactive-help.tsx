
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

export interface HelpStep {
  element: string; // This will now be a key for the diagram
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveHelpProps {
  steps: HelpStep[];
  onClose: () => void;
  diagram: React.ReactNode;
}

const HandPointer = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="32" 
        height="32" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" strokeLinejoin="round" 
        className="text-yellow-400 drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }}
    >
        <path d="M12 11V8a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" />
        <path d="M18 11V8a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" />
        <path d="M14 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5" />
        <path d="M10 11V7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
        <path d="M20.99 11.43a1.5 1.5 0 0 0-2.1-2.02l-4.22 3.12a1.5 1.5 0 0 0-.58 1.15V17a2 2 0 0 0 2 2h2.24a2 2 0 0 0 1.6-.78l2.96-4.14a1.5 1.5 0 0 0-.4-2.18Z" fill="#FFC700"/>
    </svg>
);

export const InteractiveHelp = ({ steps, onClose, diagram }: InteractiveHelpProps) => {

  const getPositionClasses = (position: HelpStep['position']) => {
    switch (position) {
      case 'top':
        return 'flex-col-reverse -top-2 translate-y-[-100%]';
      case 'bottom':
        return 'flex-col -bottom-2 translate-y-[100%]';
      case 'left':
        return 'flex-row-reverse -left-2 translate-x-[-100%]';
      case 'right':
        return 'flex-row -right-2 translate-x-[100%]';
      default:
        return 'flex-col -bottom-2 translate-y-[100%]';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the diagram
        >
          {diagram}

          {steps.map((step) => (
            <div
              key={step.element}
              className="absolute"
              style={{
                top: `var(--${step.element}-top)`,
                left: `var(--${step.element}-left)`,
                width: `var(--${step.element}-width)`,
                height: `var(--${step.element}-height)`,
              }}
            >
              <div className={`absolute flex items-center gap-2 ${getPositionClasses(step.position)}`}>
                  <div className="bg-background p-2 rounded-lg shadow-2xl border-2 border-primary max-w-xs text-center">
                    <p className="text-xs font-semibold text-foreground">{step.text}</p>
                  </div>
                  <HandPointer/>
              </div>
            </div>
          ))}

        </motion.div>
        
        <Button size="lg" onClick={onClose} className="mt-8 shadow-2xl z-10">
          Pronto, entendi!
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

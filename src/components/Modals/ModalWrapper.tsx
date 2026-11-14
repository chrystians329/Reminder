import React, { useState, useEffect } from 'react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  padding?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  className = '',
  padding = 'p-6'
}) => {
  const [rendered, setRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isOpen) {
      setRendered(true);
      setIsClosing(false);
    } else if (rendered) {
      setIsClosing(true);
      timer = setTimeout(() => {
        setRendered(false);
        setIsClosing(false);
      }, 160);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  if (!rendered) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isClosing) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm ${
        isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`w-full ${maxWidth} bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl ${padding} shadow-2xl space-y-5 ${className} ${
          isClosing ? 'animate-out zoom-out-95 duration-150' : 'animate-in zoom-in-95 duration-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

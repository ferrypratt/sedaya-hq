'use client';

import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  description,
  maxWidthClass = 'max-w-lg',
  children,
  footer,
}: ModalProps) {
  const titleId = useId();
  const subText = subtitle || description;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/45 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-paper-white border border-sand-border rounded-2xl w-full ${maxWidthClass} max-h-[90dvh] flex flex-col overflow-hidden overscroll-contain`}
      >
        <div className="px-6 py-4 border-b border-sand-border flex items-start justify-between gap-4 bg-warm-cream shrink-0">
          <div className="min-w-0">
            <h3 id={titleId} className="text-base font-bold text-ink-black leading-snug">
              {title}
            </h3>
            {subText && (
              <p className="text-xs text-stone-gray mt-0.5">{subText}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="min-w-9 min-h-9 -mr-1.5 -mt-1 inline-flex items-center justify-center rounded-full text-stone-gray hover:text-ink-black hover:bg-paper-white border border-transparent hover:border-sand-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-3.5 border-t border-sand-border bg-warm-cream flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

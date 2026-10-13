import React from 'react';

interface PageHeaderProps {
  section?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageHeader({
  section,
  eyebrow,
  title,
  description,
  actions,
  meta,
}: PageHeaderProps) {
  const sectionLabel = section || eyebrow;
  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-sand-border">
      <div className="min-w-0 space-y-1.5">
        {(sectionLabel || meta) && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ash-gray">
            {sectionLabel && (
              <span className="uppercase tracking-[0.06em] font-semibold text-stone-gray">
                {sectionLabel}
              </span>
            )}
            {sectionLabel && meta && (
              <span aria-hidden="true" className="text-sand-border">
                /
              </span>
            )}
            {meta}
          </div>
        )}
        <h1 className="text-2xl sm:text-[32px] font-bold text-ink-black tracking-tight leading-[1.12]">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-stone-gray max-w-[65ch] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}

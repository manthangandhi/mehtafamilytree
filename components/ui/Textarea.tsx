import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id: propId, ...props }, ref) => {
    const generatedId = React.useId();
    const id = propId || generatedId;

    return (
      <div>
        {label && <label htmlFor={id} className="label">{label}</label>}
        <textarea
          id={id}
          ref={ref}
          className={`input min-h-[96px] resize-y ${error ? 'border-accent' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-accent">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

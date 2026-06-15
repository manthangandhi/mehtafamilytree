import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id: propId, ...props }, ref) => {
    const generatedId = React.useId();
    const id = propId || generatedId;

    return (
      <div>
        {label && <label htmlFor={id} className="label">{label}</label>}
        <input id={id} ref={ref} className={`input ${error ? 'border-red-400 focus:ring-red-400/40 focus:border-red-500' : ''} ${className}`} {...props} />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

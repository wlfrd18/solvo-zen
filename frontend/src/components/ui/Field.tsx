import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, forwardRef } from "react";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, htmlFor, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <FieldWrapper label={label} htmlFor={inputId ?? ""} error={error}>
        <input
          ref={ref}
          id={inputId}
          className={`rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <FieldWrapper label={label} htmlFor={selectId ?? ""} error={error}>
        <select
          ref={ref}
          id={selectId}
          className={`rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${className}`}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  }
);
Select.displayName = "Select";

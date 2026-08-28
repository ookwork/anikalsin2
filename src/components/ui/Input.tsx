import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface FieldWrapProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldWrap({ label, error, hint, children }: FieldWrapProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-burgundy-dark">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-charcoal/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

const fieldBase =
  "w-full rounded-xl border bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 transition";

const fieldValidState = "border-burgundy/15 focus:border-burgundy focus:ring-burgundy/20";
const fieldErrorState = "border-red-400 focus:border-red-500 focus:ring-red-200";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <input
        ref={ref}
        aria-invalid={!!error}
        className={`${fieldBase} ${error ? fieldErrorState : fieldValidState} ${className}`}
        {...props}
      />
    </FieldWrap>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        aria-invalid={!!error}
        className={`${fieldBase} min-h-28 resize-y ${error ? fieldErrorState : fieldValidState} ${className}`}
        {...props}
      />
    </FieldWrap>
  )
);
Textarea.displayName = "Textarea";

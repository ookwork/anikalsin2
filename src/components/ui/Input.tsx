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
  "w-full rounded-xl border border-burgundy/15 bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20 transition";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <input ref={ref} className={`${fieldBase} ${className}`} {...props} />
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
      <textarea ref={ref} className={`${fieldBase} min-h-28 resize-y ${className}`} {...props} />
    </FieldWrap>
  )
);
Textarea.displayName = "Textarea";

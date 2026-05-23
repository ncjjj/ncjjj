"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean | undefined;
  autoComplete?: string | undefined;
  className?: string | undefined;
  inputClassName?: string | undefined;
  labelClassName?: string | undefined;
  buttonClassName?: string | undefined;
  placeholder?: string | undefined;
};

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  required = false,
  autoComplete = "current-password",
  className,
  inputClassName,
  labelClassName,
  buttonClassName,
  placeholder,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={inputClassName}
        />
        <button
          type="button"
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((prev) => !prev)}
          className={buttonClassName}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
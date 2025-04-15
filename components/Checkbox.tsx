"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  disabled,
}: CheckboxProps) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          disabled && "cursor-not-allowed opacity-50"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "ml-2 block text-sm font-medium text-gray-700",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {label}
      </label>
    </div>
  );
};
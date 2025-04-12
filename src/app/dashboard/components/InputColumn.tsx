'use client';

import React from 'react';

interface InputColumnProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export default function InputColumn({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = true,
}: InputColumnProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        required={required}
      />
    </div>
  );
}

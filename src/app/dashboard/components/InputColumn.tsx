'use client';

import React from 'react';

interface InputColumnProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  isError?: boolean;
}

export default function InputColumn({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = true,
  isError = false,
}: InputColumnProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500
          ${isError ? 'border-red-500 border' : 'border-gray-300'} p-1`}
        required={required}
      />
      {isError && <p className="text-red-500 text-sm mt-1">This field is required</p>}
    </div>
  );
}

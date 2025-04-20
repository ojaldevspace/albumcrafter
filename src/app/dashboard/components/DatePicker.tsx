'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  label?: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  isError?: boolean;
  required?: boolean
}

export default function CustomDatePicker({
  label = 'Select Date',
  selectedDate,
  onChange,
  isError = false,
  required = true
}: CustomDatePickerProps) {
  return (
    <div className="flex flex-col space-y-0">
      <label className="block text-sm font-medium text-gray-700">
        {label}{ required && <span className="text-red-500">*</span>}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        className={`inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset
          ${isError ? 'ring-red-500' : 'ring-gray-300'}
        `}
        dateFormat="dd-MM-yyyy"
        placeholderText="Select Date"
      />
      {isError && <p className="text-red-500 text-sm mt-1">This field is required</p>}
    </div>
  );
}

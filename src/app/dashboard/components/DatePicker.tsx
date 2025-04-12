'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CustomDatePicker({
  label = 'Select Date',
  selectedDate,
  onChange,
}: {
  label?: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}) {
  return (
    <div className="flex flex-col space-y-0">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        dateFormat="dd-MM-yyyy"
        placeholderText="Select Date"
      />
    </div>
  );
}
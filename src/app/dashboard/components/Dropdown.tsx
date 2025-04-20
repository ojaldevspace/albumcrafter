'use client';

import React from 'react';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  isError?: boolean;
}

export default function CustomDropdown({
  label,
  options,
  value,
  onChange,
  required = true,
  isError = false,
}: DropdownProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <Menu as="div" className="relative inline-block text-left w-full">
        <div>
          <MenuButton
            className={`inline-flex w-full justify-between items-center rounded-md bg-white px-3 py-2 text-sm font-normal text-gray-900 shadow-sm ring-1 ring-inset
              ${isError ? 'ring-red-500' : 'ring-gray-300'}
            `}
          >
            {value || 'Select a value'}
            <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
          </MenuButton>
        </div>

        <MenuItems className="absolute right-0 z-10 mt-2 w-full origin-top-right max-h-32 overflow-y-auto overflow-x-hidden rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <MenuItem key={option}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => onChange(option)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
      {isError && <p className="text-red-500 text-sm mt-1">This field is required</p>}
    </div>
  );
}

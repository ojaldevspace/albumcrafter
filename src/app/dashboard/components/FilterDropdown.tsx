'use client';

import { useState } from 'react';

interface FilterDropdownProps {
  selectedFilter: string;
  handleFilterChange: (filter: string) => void;
}

export default function FilterDropdown({
selectedFilter,
handleFilterChange
} : FilterDropdownProps){
    const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const filters = ['Today', 'Last 7 days', 'Last 30 days', 'Last month', 'Last year'];

  return (
    <div className="relative">
      <button
        id="dropdownRadioButton"
        onClick={toggleDropdown}
        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        type="button"
      >
        <svg
          className="w-3 h-3 text-gray-500 dark:text-gray-400 me-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z" />
        </svg>
        {selectedFilter}
        <svg
          className="w-2.5 h-2.5 ms-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          id="dropdownRadio"
          className="absolute z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
            {filters.map((filter) => (
              <li key={filter}>
                <div
                  className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => {
                    handleFilterChange(filter);
                    setDropdownOpen(false); // close dropdown on selection
                  }}
                >
                  <input
                    type="radio"
                    value={filter}
                    checked={selectedFilter === filter}
                    onChange={() => handleFilterChange(filter)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">{filter}</label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
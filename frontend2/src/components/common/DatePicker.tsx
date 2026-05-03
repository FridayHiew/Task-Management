'use client';

import { useEffect, useRef } from 'react';
import Flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrInstance = useRef<any>(null);

  useEffect(() => {
    if (inputRef.current) {
      // @ts-ignore - Flatpickr type issue
      flatpickrInstance.current = new Flatpickr(inputRef.current, {
        dateFormat: 'd M Y',
        defaultDate: value || undefined,
        onChange: (selectedDates: Date[]) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
          } else {
            onChange('');
          }
        },
        allowInput: true,
        disableMobile: true,
      });
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (flatpickrInstance.current && value !== flatpickrInstance.current.input.value) {
      flatpickrInstance.current.setDate(value, false);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder || 'Select date'}
      className={className || "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"}
      readOnly
    />
  );
}
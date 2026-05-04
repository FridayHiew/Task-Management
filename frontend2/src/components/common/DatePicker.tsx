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
      // @ts-expect-error - Flatpickr constructor type issue
      flatpickrInstance.current = new Flatpickr(inputRef.current, {
        dateFormat: 'Y-m-d',
        // 关键修复：只有当 value 有值时才设置 defaultDate
        defaultDate: value && value !== '' ? value : null,
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

  // 监听 value 变化，更新 Flatpickr 的显示
  useEffect(() => {
    if (flatpickrInstance.current) {
      if (value && value !== '') {
        flatpickrInstance.current.setDate(value, false);
      } else {
        // 如果 value 为空，清空显示
        flatpickrInstance.current.clear();
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder || 'Select date'}
      className={className || "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"}
      readOnly
    />
  );
}
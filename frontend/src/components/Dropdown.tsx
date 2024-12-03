import { useState, useRef, useEffect } from 'react';
import OptionsIcon from '../assets/images/dots.svg';

type DropdownProps = {
  options: { label: string; onClick: () => void }[];
};

export default function Dropdown({ options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 bg-transparent hover:bg-gray-200 rounded-full"
      >
        <img src={OptionsIcon} alt="Menu" className="w-5 h-4" />
      </button>
      {isOpen && (
        <div className="absolute right-10 top-0 mt-[-8px] w-32 bg-white border border-gray-300 rounded-xl shadow-xl z-10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              className="block rounded-xl w-full text-left px-4 py-2 text-sm bg-white hover:bg-gray-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Dialog } from 'tdesign-react';

export interface ModelOption {
  id: string;
  name: string;
  value: string;
  disabled?: boolean;
}

interface ModelDropdownProps {
  models: ModelOption[];
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/**
 * Non-native dropdown component for model selection.
 */
export default function ModelDropdown({ models, selected, onSelect, disabled }: ModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = models.find((m) => m.id === selected);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500'}`}
      >
        <span>{current?.name || '选择模型'}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && !disabled && (
        <ul className="absolute z-10 mb-1 bottom-full w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {models.map((model) => (
            <li
              key={model.id}
              onClick={() => {
                if (model.disabled) {
                  setDialogVisible(true);
                  return;
                }
                onSelect(model.id);
                setOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-sm hover:bg-purple-100 dark:hover:bg-gray-600 ${model.disabled ? 'opacity-40 cursor-not-allowed' : ''} ${model.id === selected ? 'bg-purple-50 dark:bg-gray-600' : ''}`}
            >
              {model.name}
            </li>
          ))}
        </ul>
      )}

      {/* Info Dialog */}
      <Dialog
        header="功能未开通"
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={() => setDialogVisible(false)}
        confirmBtn="知道了"
        cancelBtn={null}
      >
        请前往 <span className="font-semibold">Hugging Face</span> 开通相关功能，并到 <span className="font-semibold">EdgeOne Pages</span> 部署。
      </Dialog>
    </div>
  );
} 
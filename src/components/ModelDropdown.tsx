import { useState, useRef, useEffect } from 'react';
import { Dialog } from 'tdesign-react';

export interface ModelOption {
  id: string;
  name: string;
  value: string;
  platform?: string;
  disabled?: boolean;
}

interface ModelDropdownProps {
  models: ModelOption[];
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/**
 * Non-native dropdown component for model selection with platform grouping.
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

  // Group models by platform
  const groupedModels = models.reduce((groups, model) => {
    const platform = model.platform || 'Other';
    if (!groups[platform]) {
      groups[platform] = [];
    }
    groups[platform].push(model);
    return groups;
  }, {} as Record<string, ModelOption[]>);

  // Get platform names in order of appearance
  const platformOrder = Array.from(new Set(models.map(m => m.platform || 'Other')));

  // Unified platform theme configuration
  const getPlatformTheme = () => {
    return {
      gradient: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      textColor: 'text-white'
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500'}`}
      >
        <span>{current?.name || 'Select model'}</span>
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
        <ul className="absolute z-10 mb-1 bottom-full w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto transform transition-all duration-200 ease-out animate-in fade-in-0 slide-in-from-top-2">
          {platformOrder.map((platform, platformIndex) => (
            <div key={platform}>
              {/* Platform header */}
              {(() => {
                const theme = getPlatformTheme();
                return (
                  <div className={`px-4 py-3 bg-gradient-to-r ${theme.gradient} shadow-sm`}>
                    <div className="flex items-center space-x-2">
                      {theme.icon}
                      <h3 className={`text-sm font-semibold ${theme.textColor} tracking-wide`}>
                        {platform}
                      </h3>
                    </div>
                  </div>
                );
              })()}
              
              {/* Models in this platform */}
              {groupedModels[platform].map((model) => (
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
                  className={`px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 hover:bg-purple-50 dark:hover:bg-gray-600 ${model.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${model.id === selected ? 'bg-purple-100 dark:bg-gray-600 border-l-2 border-purple-500' : ''}`}
                >
                  <span className={`${model.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {model.name}
                  </span>
                </li>
              ))}
              
              {/* Add separator between platforms (except for the last one) */}
              {platformIndex < platformOrder.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-500 to-transparent mx-4"></div>
              )}
            </div>
          ))}
        </ul>
      )}

      {/* Info Dialog */}
      <Dialog
        header="Demo Version Limitations"
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={() => setDialogVisible(false)}
        confirmBtn="Got it"
        cancelBtn={null}
      >
        Please visit <span className="font-semibold">EdgeOne Pages</span> to&nbsp;
        <a href="https://edgeone.ai/pages/new?from=template&template=image-generator-starter" target="_blank" className="text-blue-600 font-semibold">deploy</a>
        &nbsp;your website and explore enhanced features (activation of the image generation functionality requires visiting&nbsp;
        <a href="https://huggingface.co/models" target="_blank" className="text-blue-600 font-semibold">Hugging Face</a> and <a href="https://studio.nebius.com/?modality=text2image" target="_blank" className="text-blue-600 font-semibold">Nebius</a>).
      </Dialog>
    </div>
  );
} 
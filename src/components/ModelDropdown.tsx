import { useState, useRef, useEffect, useMemo } from 'react';
import { Dialog, Tooltip } from 'tdesign-react';

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
 * Custom tree dropdown component for model selection with platform grouping.
 */
export default function ModelDropdown({ models, selected, onSelect, disabled }: ModelDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);

  // Group models by platform and get platform order
  const { groupedModels, platformOrder } = useMemo(() => {
    const grouped = models.reduce((groups, model) => {
      const platform = model.platform || 'Other';
      if (!groups[platform]) {
        groups[platform] = [];
      }
      groups[platform].push(model);
      return groups;
    }, {} as Record<string, ModelOption[]>);

    const order = Array.from(new Set(models.map(m => m.platform || 'Other')));
    
    return { groupedModels: grouped, platformOrder: order };
  }, [models]);

  // Initialize expanded state with first platform
  useEffect(() => {
    if (platformOrder.length > 0) {
      setExpanded([platformOrder[0]]);
    }
  }, [platformOrder]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = models.find((m) => m.id === selected);

  // Toggle platform expansion
  const togglePlatform = (platform: string) => {
    setExpanded(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  // Handle model selection
  const handleModelSelect = (model: ModelOption) => {
    if (model.disabled) {
      setDialogVisible(true);
      return;
    }
    onSelect(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500'}`}
      >
        <span>{current?.name || 'Select model'}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-10 mb-1 bottom-full w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-auto transform transition-all duration-200 ease-out">
          {platformOrder.map((platform, platformIndex) => (
            <div key={platform}>
              {/* Platform Header */}
              <div 
                className="px-4 py-3 shadow-sm cursor-pointer bg-white dark:bg-gray-700"
                onClick={() => togglePlatform(platform)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-black dark:text-gray-50 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expanded.includes(platform) ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                    </svg>
                    <h3 className="text-sm text-black dark:text-gray-50 tracking-wide">
                      {platform}
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Models in this platform */}
              {expanded.includes(platform) && (
                <div>
                  {groupedModels[platform].map((model) => (
                    model.disabled ? (
                      <Tooltip overlayStyle={{maxWidth: '350px'}} key={model.id} content={<div className='text-sm pb-2 pt-2 pl-2'>Please use your own {model.platform} token to enable this model</div>} placement="top" theme="light">
                        <div
                          onClick={() => handleModelSelect(model)}
                          className={`pl-10 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-purple-50 dark:hover:bg-gray-700 opacity-50 cursor-not-allowed ${model.id === selected ? 'bg-purple-100 dark:bg-gray-700 border-l-2 border-purple-500' : ''}`}
                        >
                          <span className="text-gray-400 dark:text-gray-400">
                            {model.name}
                          </span>
                        </div>
                      </Tooltip>
                    ) : (
                      <div
                        key={model.id}
                        onClick={() => handleModelSelect(model)}
                        className={`pl-10 px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 hover:bg-purple-50 dark:hover:bg-gray-800 ${model.id === selected ? 'bg-purple-100 dark:bg-purple-900 border-l-2 border-purple-500' : ''}`}
                      >
                        <span className="text-gray-700 dark:text-gray-50">
                          {model.name}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
              
              {/* Add separator between platforms (except for the last one) */}
              {platformIndex < platformOrder.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mx-4"></div>
              )}
            </div>
          ))}
        </div>
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
        Please go to <span className="font-semibold">EdgeOne Pages</span> to&nbsp;
        <a href="https://edgeone.ai/pages/new?from=template&template=image-generator-starter" target="_blank" className="text-blue-600 font-semibold">deploy</a>
        &nbsp; your website and explore enhanced features (activate image generation features by going to the AI platform).
      </Dialog>
    </div>
  );
} 
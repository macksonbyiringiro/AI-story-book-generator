
import React from 'react';
import { Theme } from '../types';
import { SunIcon, MoonIcon, LaptopIcon } from './icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme }) => {
    if (!isOpen) return null;

    const options = [
        { name: 'light', label: 'Light', icon: SunIcon },
        { name: 'dark', label: 'Dark', icon: MoonIcon },
        { name: 'system', label: 'System', icon: LaptopIcon },
    ] as const;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-display font-bold text-brand-dark dark:text-white mb-6">
                    Display Settings
                </h2>
                <div className="space-y-2">
                    <p className="font-semibold text-brand-text dark:text-gray-300 mb-2">Theme</p>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        {options.map(({ name, label, icon: Icon }) => (
                            <button
                                key={name}
                                onClick={() => setTheme(name)}
                                className={`w-full flex items-center justify-center gap-2 rounded-md p-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                                    theme === name 
                                        ? 'bg-white dark:bg-brand-primary text-brand-primary dark:text-white shadow' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                aria-pressed={theme === name}
                            >
                                <Icon className="w-5 h-5"/>
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-8 text-right">
                     <button
                        onClick={onClose}
                        className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        aria-label="Close settings"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

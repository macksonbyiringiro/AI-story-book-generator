
import React, { useState, useEffect } from 'react';
import { LoadingSpinner, MagicWandIcon, CastleIcon, RocketIcon, MagnifyingGlassIcon, SparklesIcon } from './icons';
import { StoryTheme } from '../types';

interface StoryInputFormProps {
  onSubmit: (formData: { prompt: string; theme: StoryTheme, pageCount: number }) => void;
  isLoading: boolean;
}

const themes: { name: StoryTheme; icon: React.FC<{className?: string}> }[] = [
    { name: 'Fairy Tale', icon: CastleIcon },
    { name: 'Sci-Fi Adventure', icon: RocketIcon },
    { name: 'Mystery', icon: MagnifyingGlassIcon },
    { name: 'Whimsical Wonderland', icon: SparklesIcon },
];

const StoryInputForm: React.FC<StoryInputFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<StoryTheme>('Whimsical Wonderland');
  const [pageCount, setPageCount] = useState(5);

  const placeholderPrompts = [
    "A brave little squirrel who is afraid of heights...",
    "A magical paintbrush that brings drawings to life...",
    "A friendly robot who wants to learn how to bake a cake...",
    "Two best friends, a bear and a firefly, on a quest to find the moon...",
    "A mysterious seed that grows into a candy castle...",
  ];
  
  const [placeholder, setPlaceholder] = useState(placeholderPrompts[0]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
        setPlaceholder(p => {
            const currentIndex = placeholderPrompts.indexOf(p);
            const nextIndex = (currentIndex + 1) % placeholderPrompts.length;
            return placeholderPrompts[nextIndex];
        });
    }, 4000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit({ prompt, theme: selectedTheme, pageCount });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
        <div>
            <label htmlFor="story-prompt" className="block font-display text-2xl font-semibold text-brand-text dark:text-gray-100 mb-3">
            What's your story idea?
            </label>
            <textarea
            id="story-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="w-full h-28 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition duration-300 resize-none text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            disabled={isLoading}
            />
        </div>

        <div>
            <h3 className="block font-display text-2xl font-semibold text-brand-text dark:text-gray-100 mb-3">Choose a theme</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themes.map(({ name, icon: Icon }) => (
                    <button
                        type="button"
                        key={name}
                        onClick={() => setSelectedTheme(name)}
                        disabled={isLoading}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                            ${selectedTheme === name 
                                ? 'bg-brand-light border-brand-primary text-brand-primary dark:bg-blue-900/50 dark:border-brand-primary' 
                                : 'bg-white border-gray-300 text-gray-600 hover:border-brand-primary hover:text-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-brand-primary'
                            }`}
                    >
                        <Icon className="w-8 h-8"/>
                        <span className="font-semibold text-sm">{name}</span>
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label htmlFor="page-count" className="block font-display text-2xl font-semibold text-brand-text dark:text-gray-100 mb-3">
                How many pages? <span className="text-brand-primary font-bold">{pageCount}</span>
            </label>
            <input
                type="range"
                id="page-count"
                min="3"
                max="7"
                step="1"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary dark:bg-gray-600"
            />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <MagicWandIcon />
              <span>Generate Storybook</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default StoryInputForm;
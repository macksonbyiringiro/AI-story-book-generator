
import React from 'react';
import { BookOpenIcon, CastleIcon, MagnifyingGlassIcon, RocketIcon, SparklesIcon } from './icons';

interface HomePageProps {
    onStartCreating: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartCreating }) => {
  return (
    <div className="text-center animate-fade-in py-12 md:py-20">
        <div className="relative inline-block mb-8">
            <BookOpenIcon className="w-24 h-24 text-brand-primary" />
            <SparklesIcon className="w-8 h-8 text-brand-secondary absolute -top-2 -right-2 animate-pulse" />
        </div>
        
        <h2 className="text-4xl md:text-6xl font-display font-bold text-brand-primary dark:text-brand-light">
            Turn Your Ideas into Illustrated Stories
        </h2>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Just type in an idea, choose a theme and length, and our AI will write and illustrate a complete storybook for you! Ready to bring your imagination to life?
        </p>

        <div className="mt-12">
            <button
                onClick={onStartCreating}
                className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xl transform hover:scale-105"
            >
                Create Your Storybook
            </button>
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-display font-semibold text-brand-dark dark:text-gray-200 mb-6">Explore Endless Possibilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-700 dark:text-gray-400">
                <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <CastleIcon className="w-12 h-12 text-brand-secondary mb-3"/>
                    <span className="font-semibold">Fairy Tales</span>
                </div>
                 <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <RocketIcon className="w-12 h-12 text-brand-secondary mb-3"/>
                    <span className="font-semibold">Sci-Fi Adventures</span>
                </div>
                 <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <MagnifyingGlassIcon className="w-12 h-12 text-brand-secondary mb-3"/>
                    <span className="font-semibold">Mysteries</span>
                </div>
                 <div className="flex flex-col items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <SparklesIcon className="w-12 h-12 text-brand-secondary mb-3"/>
                    <span className="font-semibold">Wonderlands</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HomePage;

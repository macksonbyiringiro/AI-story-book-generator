
import React from 'react';
import { StoryBook } from '../types';

interface StoryViewerProps {
  storyBook: StoryBook;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ storyBook }) => {
  return (
    <div id="storybook-content" className="w-full mt-12">
      <h2 className="text-4xl md:text-5xl font-display font-bold text-center text-brand-dark dark:text-brand-light mb-8">
        {storyBook.title}
      </h2>
      <div className="space-y-16">
        {storyBook.pages.map((page) => (
          <div
            key={page.pageNumber}
            id={`page-${page.pageNumber}`}
            className="storybook-page-container max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center"
          >
            <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner mb-6">
               <img src={page.imageUrl} alt={`Illustration for page ${page.pageNumber}`} className="w-full h-full object-cover" />
            </div>
            <p className="text-lg md:text-xl text-brand-text dark:text-gray-300 leading-relaxed font-sans text-justify">
              {page.text}
            </p>
            <div className="mt-6 font-display text-lg font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
              Page {page.pageNumber} / {storyBook.pages.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryViewer;

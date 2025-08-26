
import React, { useState, useCallback, useEffect } from 'react';
import { StoryBook, StoryTheme } from './types';
import { generateStoryBook } from './services/geminiService';
import StoryInputForm from './components/StoryInputForm';
import StoryViewer from './components/StoryViewer';
import HomePage from './components/HomePage';
import SettingsModal from './components/SettingsModal';
import { useTheme } from './hooks/useTheme';
import { BookOpenIcon, DownloadIcon, LoadingSpinner, PlusCircleIcon, ShareIcon, CheckIcon, GearIcon } from './components/icons';

const LOCAL_STORAGE_key = 'ai-storybook';

// Helper functions for sharing
const compressAndEncodeStory = (story: StoryBook): string => {
  const jsonString = JSON.stringify(story);
  const compressed = window.pako.deflate(jsonString);
  
  let binaryString = '';
  const CHUNK_SIZE = 8192;
  for (let i = 0; i < compressed.length; i += CHUNK_SIZE) {
    binaryString += String.fromCharCode.apply(null, compressed.subarray(i, i + CHUNK_SIZE) as any);
  }

  return btoa(binaryString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
};

const decodeAndDecompressStory = (encoded: string): StoryBook | null => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const jsonString = window.pako.inflate(bytes, { to: 'string' });
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to decode/decompress story", e);
    return null;
  }
};


const App: React.FC = () => {
  const [storyBook, setStoryBook] = useState<StoryBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [view, setView] = useState<'home' | 'create' | 'viewing'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/story/')) {
        const encodedData = hash.substring('#/story/'.length);
        const storyFromUrl = decodeAndDecompressStory(encodedData);
        if (storyFromUrl) {
            setStoryBook(storyFromUrl);
            setView('viewing');
            window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            return;
        }
    }

    try {
      const savedStory = localStorage.getItem(LOCAL_STORAGE_key);
      if (savedStory) {
        setStoryBook(JSON.parse(savedStory));
        setView('viewing');
      } else {
        setView('home');
      }
    } catch (err) {
      console.error("Failed to load story from local storage:", err);
      localStorage.removeItem(LOCAL_STORAGE_key);
      setView('home');
    }
  }, []);

  useEffect(() => {
    if (storyBook) {
      try {
        localStorage.setItem(LOCAL_STORAGE_key, JSON.stringify(storyBook));
      } catch (err) {
        console.error("Failed to save story to local storage:", err);
      }
    }
  }, [storyBook]);

  const handleGenerateStory = useCallback(async (formData: { prompt: string; theme: StoryTheme, pageCount: number }) => {
    setIsLoading(true);
    setError(null);
    setStoryBook(null);
    setView('create'); 
    setProgressMessage('Warming up the magic ink...');
    try {
      const { prompt, theme, pageCount } = formData;
      const generatedBook = await generateStoryBook(prompt, theme, pageCount, setProgressMessage);
      setStoryBook(generatedBook);
      setView('viewing');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  }, []);
  
  const handleDownloadPdf = async () => {
    if (!storyBook || !document.getElementById('storybook-content')) return;

    setIsDownloading(true);
    setError(null);
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pageElements = document.querySelectorAll('.storybook-page-container');
        
        for (let i = 0; i < pageElements.length; i++) {
            const pageElement = pageElements[i] as HTMLElement;
            if (i > 0) pdf.addPage();
            
            const canvas = await window.html2canvas(pageElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasRatio = canvas.width / canvas.height;
            
            const renderWidth = pdfWidth - 20; // with margin
            const renderHeight = renderWidth / canvasRatio;
            const y = (pdfHeight - renderHeight) / 2;

            pdf.addImage(imgData, 'PNG', 10, y, renderWidth, renderHeight);
        }
        
        const safeTitle = storyBook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${safeTitle}_storybook.pdf`);

    } catch (err) {
        console.error("PDF Generation Error:", err);
        setError("Sorry, we couldn't create the PDF. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleStartNewStory = () => {
    setStoryBook(null);
    setError(null);
    localStorage.removeItem(LOCAL_STORAGE_key);
    setView('create');
  };

  const handleShare = async () => {
    if (!storyBook) return;
    const encodedData = compressAndEncodeStory(storyBook);
    const shareUrl = `${window.location.origin}${window.location.pathname}#/story/${encodedData}`;
    try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
        console.error("Failed to copy share link:", err);
        setError("Could not copy the link. You may need to grant clipboard permissions.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div role="status" aria-live="polite" className="mt-12 text-center flex flex-col items-center gap-4">
          <LoadingSpinner className="w-12 h-12 text-brand-primary animate-spin"/>
          <p className="text-xl font-semibold text-brand-dark dark:text-gray-200 animate-pulse">{progressMessage}</p>
        </div>
      );
    }

    if(view === 'viewing' && storyBook) {
      return (
        <div className="animate-fade-in">
          <StoryViewer storyBook={storyBook} />
        </div>
      );
    }

    if (view === 'create') {
      return (
          <div className="animate-fade-in">
             <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-primary dark:text-brand-light">
                    Let's Create a Story!
                </h2>
                <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Fill out the details below and watch the magic happen.
                </p>
            </div>
            <StoryInputForm onSubmit={handleGenerateStory} isLoading={isLoading} />
          </div>
      );
    }
    
    return <HomePage onStartCreating={() => setView('create')} />;
  };

  return (
    <div className="bg-brand-bg dark:bg-gray-900 min-h-screen font-sans text-brand-text dark:text-gray-300 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => setView('home')} className="flex items-center gap-3" aria-label="Go to homepage">
            <BookOpenIcon className="w-8 h-8 text-brand-primary" />
            <h1 className="text-2xl font-display font-bold text-brand-dark dark:text-white">
              AI Story Book Generator
            </h1>
          </button>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {view === 'viewing' && !isLoading && (
              <>
                  <button
                      onClick={handleStartNewStory}
                      className="hidden sm:flex items-center gap-2 border-2 border-brand-primary text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-300"
                  >
                      <PlusCircleIcon className="h-5 w-5"/>
                      <span>New Story</span>
                  </button>
                  <button
                      onClick={handleShare}
                      className={`flex items-center gap-2 border-2 font-bold py-2 px-4 rounded-lg transition-all duration-300 ${isCopied ? 'bg-green-500 border-green-500 text-white' : 'border-brand-primary text-brand-primary hover:bg-brand-light dark:hover:bg-gray-700'}`}
                  >
                      {isCopied ? <CheckIcon className="h-5 w-5"/> : <ShareIcon className="h-5 w-5"/>}
                      <span>{isCopied ? 'Copied!' : 'Share'}</span>
                  </button>
                  <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="flex items-center gap-2 bg-brand-secondary hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                      {isDownloading ? <LoadingSpinner className="animate-spin h-5 w-5"/> : <DownloadIcon className="h-5 w-5"/>}
                      <span className="hidden sm:inline">{isDownloading ? 'Saving...' : 'Download'}</span>
                  </button>
              </>
            )}
             <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Open settings"
             >
                <GearIcon className="h-6 w-6"/>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
        {error && (
            <div role="alert" aria-live="assertive" className="mt-8 text-center bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg max-w-2xl mx-auto">
                <strong className="font-bold">Oh no! </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
      </main>

      <footer className="text-center py-6 mt-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
        <p className="text-gray-500 dark:text-gray-400">Created with ❤️ and a sprinkle of AI magic.</p>
      </footer>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />
    </div>
  );
};

export default App;

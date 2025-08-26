
export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl: string;
}

export interface StoryBook {
  title: string;
  pages: StoryPage[];
}

export type StoryTheme = 'Fairy Tale' | 'Sci-Fi Adventure' | 'Mystery' | 'Whimsical Wonderland';

export type Theme = 'light' | 'dark' | 'system';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
    pako: any;
  }
}

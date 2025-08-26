import { GoogleGenAI, Type } from "@google/genai";
import { StoryBook, StoryPage, StoryTheme } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!process.env.API_KEY) {
        // This error will be caught by the App component and displayed to the user.
        throw new Error("The API_KEY environment variable is not set. Please configure it in your deployment settings.");
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};


interface RawStoryPage {
  paragraph: string;
  image_prompt: string;
}

interface RawStoryContent {
  title: string;
  pages: RawStoryPage[];
}

async function generateStoryContent(prompt: string, theme: StoryTheme, pageCount: number): Promise<RawStoryContent> {
  const model = "gemini-2.5-flash";
  const fullPrompt = `Create a short children's story with a '${theme}' theme, based on the following idea: "${prompt}".
    The story must be exactly ${pageCount} paragraphs long.
    For each paragraph, also create a simple, descriptive prompt for an accompanying illustration in a vibrant, whimsical, digital art style suitable for a children's book, fitting the '${theme}' theme.
    Your response must be a JSON object.
    `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A creative title for the story." },
      pages: {
        type: Type.ARRAY,
        description: `An array of ${pageCount} pages for the story.`,
        items: {
          type: Type.OBJECT,
          properties: {
            paragraph: { type: Type.STRING, description: "One paragraph of the story." },
            image_prompt: { type: Type.STRING, description: "A prompt for an illustration for this paragraph." }
          },
          required: ["paragraph", "image_prompt"]
        }
      }
    },
    required: ["title", "pages"]
  };

  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    const storyData = JSON.parse(response.text);
    if (!storyData.pages || storyData.pages.length === 0) {
      throw new Error("AI failed to generate story content in the expected format.");
    }
    return storyData;
  } catch (error) {
    console.error("Error generating story content:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate the story's text. Please try again.");
  }
}

async function generateImage(prompt: string, theme: StoryTheme): Promise<string> {
  try {
    const aiClient = getAiClient();
    const response = await aiClient.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: `${prompt}, ${theme} theme, whimsical children's book illustration, vibrant colors, friendly characters, storybook style, digital art`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate an illustration. Please try again.");
  }
}

export const generateStoryBook = async (prompt: string, theme: StoryTheme, pageCount: number, updateProgress: (message: string) => void): Promise<StoryBook> => {
  updateProgress("Crafting a magical story for you...");
  const storyContent = await generateStoryContent(prompt, theme, pageCount);

  const pages: StoryPage[] = [];
  const totalPages = storyContent.pages.length;

  for (let i = 0; i < totalPages; i++) {
    const pageData = storyContent.pages[i];
    updateProgress(`Painting pictures for page ${i + 1} of ${totalPages}...`);
    const imageUrl = await generateImage(pageData.image_prompt, theme);
    pages.push({
      pageNumber: i + 1,
      text: pageData.paragraph,
      imageUrl: imageUrl
    });
  }

  updateProgress("Your storybook is ready!");
  return { title: storyContent.title, pages: pages };
};
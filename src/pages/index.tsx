import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import ModelDropdown from "../components/ModelDropdown";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface GeneratedImage {
  id: string;
  platform: string;
  model: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

const platform = {
  id: 'huggingface',
  name: 'Hugging Face',
};

// Base model definitions
const baseModels = [
  { id: 'blackschnell', name: 'black-forest-labs/flux-schnell', value: "black-forest-labs/flux-schnell", platform: 'nebius' },
  { id: 'sdxl', name: 'stabilityai/stable-diffusion-xl-base-1.0', value: "stability-ai/sdxl",  platform: 'nebius'},
  { id: 'blackdev', name: 'black-forest-labs/flux-dev', value: "black-forest-labs/flux-dev", platform: 'nebius', disabled: true},
  { id: 'pixelxl', name: 'nerijs/pixel-art-xl', value: "nerijs/pixel-art-xl", platform: 'huggingface', disabled: true},
  { id: 'hidreamfull1', name: 'HiDream-ai/HiDream-I1-Full', value: "HiDream-ai/HiDream-I1-Full", platform: 'huggingface', disabled: true},
  { id: 'btsd', name: 'ByteDance/Hyper-SD', value: "ByteDance/Hyper-SD", disabled: true, platform: 'huggingface' },
  { id: 'sdxl-turbo', name: 'stabilityai/sdxl-turbo', value: "stabilityai/sdxl-turbo", disabled: true, platform: 'huggingface'},
];

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [displayPlatformName, setDisplayPlatformName] = useState<string>('Hugging Face');

  // Token availability states (default false, updated after API call)
  const [hasHfToken, setHasHfToken] = useState<boolean>(false);
  const [hasNebiusToken, setHasNebiusToken] = useState<boolean>(false);
  const disabledList = ['pixelxl', 'hidreamfull1', 'btsd', 'sdxl-turbo'];

  // Fetch token presence once on mount
  useEffect(() => {
    fetch('/v1/token-status')
      .then(async (res) => {
        try {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            throw new Error('Unexpected content type');
          }
          return await res.json();
        } catch (err) {
          console.warn('token-status response is not valid JSON:', err);
          return { hfToken: false, nebiusToken: false };
        }
      })
      .then((data: { hfToken?: boolean; nebiusToken?: boolean }) => {
        setHasHfToken(Boolean(data?.hfToken));
        setHasNebiusToken(Boolean(data?.nebiusToken));
      })
      .catch((err) => {
        console.error('Failed to fetch token status:', err);
      });
  }, []);

  const models = useMemo(() => {
    return baseModels.map((m) => {
      let disabled = m.disabled ?? false;
   
      if (m.platform === 'huggingface') {
        disabled = !hasHfToken;
      }
      if (m.platform === 'nebius') {
        disabled = !hasNebiusToken;
      }
      // Always disable if in disabledList
      if (disabledList.includes(m.id)) {
        disabled = true;
      }
      return { ...m, disabled };
    });
  }, [hasHfToken, hasNebiusToken]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update display platform when selected model changes
  useEffect(() => {
    const modelInfo = models.find((m) => m.id === selectedModel);
    setDisplayPlatformName(modelInfo?.platform === 'nebius' ? 'Nebius' : 'Hugging Face');
  }, [selectedModel]);

  // Generation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = Math.round((prev + 0.1) * 10) / 10;
          return next;
        });
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Ensure selectedModel stays in sync with enabled models
  useEffect(() => {
    const enabledModels = models.filter((m) => !m.disabled);
    if (enabledModels.length === 0) {
      setSelectedModel('');
    } else {
      // If current selection is disabled or empty, pick first enabled
      const isCurrentValid = enabledModels.some((m) => m.id === selectedModel);
      if (!isCurrentValid) {
        setSelectedModel(enabledModels[0].id);
      }
    }
  }, [models]);

  const generateImages = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    
    // Get currently selected model info
    const modelInfo = models.find(m => m.id === selectedModel && !m.disabled);
    
    if (!modelInfo) {
      // No valid model available
      setGeneratedImages([{ id:`${Date.now()}`, platform:'', model:'', prompt:prompt, imageUrl:'', timestamp:new Date(), error:'No model available', isLoading:false }]);
      setIsGenerating(false);
      return;
    }

    // Create a loading placeholder record
    const loadingImage = {
      id: `${Date.now()}-${platform.id}`,
      platform: displayPlatformName,
      model: modelInfo.name,
      prompt: prompt,
      imageUrl: '',
      timestamp: new Date(),
      isLoading: true
    };

    setGeneratedImages([loadingImage]);

    try {
      // Call backend API to generate image
      const res = await fetch('/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: `${prompt} (${modelInfo.name} style)`,
          platform: platform.id,
          model: modelInfo.value || selectedModel,
        })
      });

      const data = await res.json();
      
      if (!res.ok || data.error) {
        // API returned an error
        setGeneratedImages([
          {
            ...loadingImage,
            imageUrl: '',
            isLoading: false,
            error: data.error || `HTTP error: ${res.status}`,
          },
        ]);
      } else {
        if (data.imageBase64) {
          setGeneratedImages([
            {
              ...loadingImage,
              imageUrl: `data:image/png;base64,${data.imageBase64}`,
              isLoading: false,
              error: undefined,
            },
          ]);
        } else {
          // No image data returned; treat as an error instead of showing a random placeholder
          setGeneratedImages([
            {
              ...loadingImage,
              imageUrl: '',
              isLoading: false,
              error: data.error || 'No image was returned by the API',
            },
          ]);
        }
      }

    } catch (error) {
      console.error(`${displayPlatformName} generation failed:`, error);
      
      // When generation fails, show an error card
      setGeneratedImages([{
        ...loadingImage,
        imageUrl: '',
        error: (error as Error).message || 'Generation failed',
        isLoading: false,
      }]);
    }

    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await generateImages(inputValue);
  };

  const examplePrompts = [
    "A cute orange kitten playing in a garden",
    "A futuristic city night scene with neon lights", 
    "A watercolor landscape painting of mountains and rivers",
  ];

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-50 dark:bg-gray-900 font-[family-name:var(--font-geist-sans)]`}>
      {/* Header / Navbar */}
      <header className="bg-gray-100 dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 128 128"><path fill="oklch(62.7% .265 303.9)" d="M105.33 1.6H22.67A22.64 22.64 0 0 0 0 24.27v79.46a22.64 22.64 0 0 0 22.67 22.67h82.66A22.64 22.64 0 0 0 128 103.73V24.27A22.64 22.64 0 0 0 105.33 1.6m-27.09 88H67.09a.82.82 0 0 1-.85-.59l-4.37-12.74H42L38 88.8a.93.93 0 0 1-1 .75H27c-.58 0-.74-.32-.58-1l17.1-49.4c.16-.54.32-1.12.53-1.76a18 18 0 0 0 .32-3.47a.54.54 0 0 1 .43-.59h13.81c.43 0 .64.16.7.43l19.46 54.93c.16.59 0 .86-.53.86Zm18.4-.6c0 .59-.21.85-.69.85H85.49a.75.75 0 0 1-.8-.85V47.89c0-.53.22-.74.7-.74H96c.48 0 .69.26.69.74Zm-1.12-48.2a6.3 6.3 0 0 1-4.85 1.87a6.6 6.6 0 0 1-4.75-1.87a6.87 6.87 0 0 1-1.81-4.91A6.23 6.23 0 0 1 86 31.15a6.8 6.8 0 0 1 4.74-1.87a6.4 6.4 0 0 1 4.86 1.87a6.75 6.75 0 0 1 1.76 4.74a6.76 6.76 0 0 1-1.84 4.91M58.67 65.44H45.12c.8-2.24 1.6-4.75 2.35-7.47s1.65-5.33 2.45-7.89a65 65 0 0 0 1.81-6.88h.11c.37 1.28.75 2.67 1.17 4.16s.91 3.09 1.44 4.75s1 3.25 1.55 4.9s1 3.15 1.44 4.59s.91 2.72 1.23 3.84"/></svg>
            <span className="text-gray-800 dark:text-white text-xl font-semibold">Image Generator</span>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-6 text-gray-600 dark:text-gray-300 text-sm">
            <a
              href="https://github.com/q153877011/image-generator-starter"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 0C5.372 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.111.793-.262.793-.583 0-.288-.01-1.049-.016-2.058-3.338.726-4.042-1.61-4.042-1.61-.546-1.389-1.333-1.759-1.333-1.759-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.419-1.305.762-1.605-2.665-.304-5.467-1.332-5.467-5.932 0-1.31.468-2.381 1.235-3.221-.124-.303-.536-1.522.117-3.176 0 0 1.008-.322 3.301 1.23a11.51 11.51 0 013.003-.404c1.02.005 2.046.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.654.243 2.873.12 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.625-5.48 5.921.43.372.814 1.102.814 2.222 0 1.604-.015 2.898-.015 3.293 0 .323.19.699.8.58C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </header>

       {/* Main Content Area - Left Right Layout */}
       <main className="max-w-7xl mx-auto px-4 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-200px)]">
           
           {/* Left Side - Input and Model Selection */}
           <div className="space-y-6">
             
             {/* Text Input Card */}
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                 Image Description
               </h2>
               
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <textarea
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     placeholder="Describe the image you want, e.g. A cute orange kitten playing in a garden..."
                     className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                     rows={4}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSubmit(e);
                       }
                     }}
                   />
                 </div>
                 
                 <div className="flex items-center justify-between">
                   <div className="text-sm text-gray-500 dark:text-gray-400">
                     Press Enter to generate, Shift + Enter for newline
                   </div>
                   
                   <button
                     type="submit"
                     disabled={!inputValue.trim() || isGenerating || !selectedModel}
                     className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                   >
                     {isGenerating ? (
                       <>
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Generating...</span>
                       </>
                     ) : (
                       <>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                         <span>Generate</span>
                       </>
                     )}
                   </button>
                 </div>
               </form>

               {/* Example Prompts */}
               <div className="mt-6">
                 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Example Prompts:
                 </h3>
                 <div className="grid grid-cols-1 gap-2">
                   {examplePrompts.map((prompt, index) => (
                     <button
                       key={index}
                       onClick={() => setInputValue(prompt)}
                       className="p-3 text-left text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-200 text-gray-700 dark:text-gray-300"
                     >
                       {prompt}
                     </button>
                   ))}
                 </div>
               </div>
             </div>

             {/* Model Selection Card */}
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Model Selection
               </h2>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                     {displayPlatformName}
                   </label>
                   <ModelDropdown
                     models={models}
                     selected={selectedModel}
                     onSelect={setSelectedModel}
                     disabled={isGenerating || models.filter(m=>!m.disabled).length===0}
                   />
                 </div>
               </div>
             </div>
           </div>

           {/* Right Side - Generated Images Display */}
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full">
             
             {/* Header */}
             <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-t-xl">
               <h2 className="text-lg font-bold text-white">
                 Generation Result
               </h2>
               {generatedImages.length > 0 && (
                 <p className="text-purple-100 text-sm mt-1">
                   Prompt: "{generatedImages[0]?.prompt}"
                 </p>
               )}
             </div>

             {/* Content */}
             <div className="flex-1 p-0">
               {isClient && generatedImages.length === 0 ? (
                 <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Waiting for Image Generation
                    </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter image description on the left and select a Hugging Face model, then click the generate button to start creating
                  </p>
                 </div>
               ) : (
                 <div className="w-full h-full">
                   {generatedImages.length > 0 && (
                     <div className="overflow-hidden flex flex-col h-full">
                       {/* Image with hover download */}
                       <div className="relative bg-gray-100 dark:bg-gray-600 group flex-1">
                         {generatedImages[0]?.isLoading ? (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="text-center">
                               <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                               <p className="text-sm text-gray-600 dark:text-gray-400">Generating {elapsedSeconds.toFixed(1)}s</p>
                             </div>
                           </div>
                         ) : generatedImages[0]?.imageUrl ? (
                           <>
                             <Image
                               src={generatedImages[0].imageUrl}
                               alt={`${displayPlatformName} generated image`}
                               fill
                               className="object-cover"
                               sizes="(max-width: 768px) 100vw, 50vw"
                               unoptimized
                             />
                             {/* Download button */}
                             <a
                               href={generatedImages[0].imageUrl}
                               download={`${(generatedImages[0]?.prompt || 'image').slice(0, 10).trim().replace(/\s+/g, '-')}.png`}
                               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                               aria-label="下载图片"
                             >
                               <svg
                                 className="w-10 h-10 text-white bg-black bg-opacity-60 rounded-full p-2 shadow-lg hover:bg-opacity-80 transition-colors"
                                 fill="currentColor"
                                 viewBox="0 0 24 24"
                               >
                                 <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm-7 2v2h14v-2H5z" />
                               </svg>
                             </a>
                           </>
                         ) : generatedImages[0]?.error ? (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="text-center text-red-500 px-4">
                               <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                               </svg>
                               <p className="text-sm">{generatedImages[0]?.error}</p>
                             </div>
                           </div>
                         ) : (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="text-center text-gray-400">
                               <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                               </svg>
                               <p className="text-sm">等待生成</p>
                             </div>
                           </div>
                         )}
                       </div>
                       
                       {/* Footer / Info Section */}
                       <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 space-y-1">
                         <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                           {generatedImages[0]?.platform || 'Hugging Face'}
                         </h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                          Model used:  {generatedImages[0]?.model || '--'}
                         </p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">
                          Generation time: {isClient && generatedImages[0] ? generatedImages[0].timestamp.toLocaleTimeString() : '--'}
                         </p>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>
           </div>
         </div>
       </main>
    </div>
  );
}

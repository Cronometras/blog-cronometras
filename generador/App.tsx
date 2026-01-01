import React, { useState, useCallback, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
    signInWithEmail,
    signOut, 
    onAuthChange,
    listenToCredentials,
    saveCredential,
    updateCredential,
    deleteCredential
} from './services/firebaseService';
import { generateArticle, createImagePrompt, generateImage, generatePodcastScript, generatePodcastAudio } from './services/geminiService';
import { uploadImage, publishPost } from './services/wordpressService';
import type { WordPressCredentials, ArticleData } from './types';

// Let TypeScript know about the 'marked' library from the CDN
declare const marked: any;

// --- Helper Components (Icons & Spinners) ---

const LoadingSpinner: React.FC<{className?: string}> = ({ className = "h-5 w-5" }) => (
  <svg className={`animate-spin text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
);

const SoundWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h8.25a.75.75 0 0 1 .75.75v 9a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1-.75-.75v-9a.75.75 0 0 1 .75-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h.75m.75 0h.75m.75 0h.75m5.25 0h.75m.75 0h.75m.75 0h.75M3 13.5h.75m1.5 0h.75m4.5 0h.75m.75 0h.75m.75 0h.75m.75 0h.75" />
    </svg>
);


const WordPressIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
        <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.83 16.5l-1.33-4.02L5 13.91V9.5h3.96l.83 2.5 1.13-3.69 1.46 4.75-1.92-1.92-1.13 3.35H8.83zm8.97-4.41c0-1.98-1.52-3.59-3.5-3.59-1.98 0-3.5 1.61-3.5 3.59s1.52 3.59 3.5 3.59c1.98 0 3.5-1.61 3.5-3.59zm-5.5 0c0-1.1.9-2.09 2-2.09s2 .99 2 2.09-.9 2.09-2 2.09-2-.99-2-2.09zm5.5 4.41h-1.5l-1.25-3.3h-1.5l1.25 3.3h-1.5l-2-6h6.5l-1 2.65.75 3.35z" clipRule="evenodd"/>
    </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

// --- Login Component ---
const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const handleAuthAction = async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);
      setError(null);
      try {
        await signInWithEmail(email, password);
        // On success, the onAuthChange listener in App.tsx will handle the rest
      } catch (e: any) {
        // Map Firebase error codes to user-friendly messages
        switch (e.code) {
          case 'auth/invalid-email':
            setError('El formato del correo electrónico no es válido.');
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
              setError('Correo electrónico o contraseña incorrectos.');
              break;
          default:
            setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
            break;
        }
        setIsLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="text-center mb-8 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            Generador de Artículos SEO con IA
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Inicia sesión para continuar.
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 w-full max-w-sm">
          <form onSubmit={handleAuthAction} className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner className="h-6 w-6" /> : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
};

// --- Progress Tracking Component ---
type ProgressStep = 'IDLE' | 'GENERATING_ARTICLE' | 'GENERATING_IMAGE' | 'UPLOADING_IMAGE' | 'PUBLISHING_POST' | 'SUCCESS' | 'ERROR';

const progressStepsConfig: { [key in Exclude<ProgressStep, 'IDLE' | 'SUCCESS' | 'ERROR'>]: { label: string; order: number } } = {
    GENERATING_ARTICLE: { label: 'Generando artículo...', order: 1 },
    GENERATING_IMAGE: { label: 'Generando imagen...', order: 2 },
    UPLOADING_IMAGE: { label: 'Subiendo imagen a WordPress...', order: 3 },
    PUBLISHING_POST: { label: 'Publicando post...', order: 4 },
};
const generationSteps = ['GENERATING_ARTICLE', 'GENERATING_IMAGE'];
const publishingSteps = ['UPLOADING_IMAGE', 'PUBLISHING_POST'];


const ProgressTracker: React.FC<{
    currentStep: ProgressStep,
    isPublishingFlow: boolean
}> = ({ currentStep, isPublishingFlow }) => {
    
    const stepsToShow = isPublishingFlow ? publishingSteps : generationSteps;
    const currentConfig = progressStepsConfig[currentStep as keyof typeof progressStepsConfig];

    if (currentStep === 'IDLE' || currentStep === 'SUCCESS' || currentStep === 'ERROR' || !currentConfig) return null;

    // Only show the tracker if the current step belongs to the current flow
    if (!stepsToShow.includes(currentStep)) return null;

    const activeStepOrder = currentConfig.order;

    return (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
                <LoadingSpinner className="h-4 w-4" />
                <p className="font-semibold text-gray-300">{currentConfig.label}</p>
            </div>
            <div className="flex items-center gap-2">
                {Object.entries(progressStepsConfig)
                    .filter(([key]) => stepsToShow.includes(key))
                    .sort(([, a], [, b]) => a.order - b.order)
                    .map(([key, config]) => {
                    const isCompleted = config.order < activeStepOrder;
                    const isActive = key === currentStep;
                    return (
                        <div key={key} className="flex-1 h-2 rounded-full bg-gray-700">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-transparent'}`}
                                style={{ width: '100%' }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main App Component ---

const EMPTY_CREDENTIALS: Omit<WordPressCredentials, 'id'> = {
    blogName: '',
    siteUrl: '',
    username: '',
    applicationPassword: '',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [savedCredentials, setSavedCredentials] = useState<WordPressCredentials[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>('');
  const [currentCredential, setCurrentCredential] = useState<Omit<WordPressCredentials, 'id'>>(EMPTY_CREDENTIALS);
  const [isEditingCredentials, setIsEditingCredentials] = useState<boolean>(true);

  const [topic, setTopic] = useState<string>('');
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [podcastScript, setPodcastScript] = useState<string | null>(null);
  const [podcastChapter, setPodcastChapter] = useState<string>('');
  const [podcastAudioBase64, setPodcastAudioBase64] = useState<string | null>(null);
  
  const [isRegeneratingImage, setIsRegeneratingImage] = useState<boolean>(false);
  const [isLoadingPodcastScript, setIsLoadingPodcastScript] = useState<boolean>(false);
  const [isScriptCopied, setIsScriptCopied] = useState<boolean>(false);
  const [isLoadingPodcastAudio, setIsLoadingPodcastAudio] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>('IDLE');
  
  const [error, setError] = useState<string | null>(null);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  
  const isProcessRunning = progressStep !== 'IDLE' && progressStep !== 'SUCCESS' && progressStep !== 'ERROR';

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(authUser => {
      setUser(authUser);
      setIsAuthLoading(false);
      if (!authUser) {
          // Clear all user-related state on logout
          setSavedCredentials([]);
          setSelectedCredentialId('');
          setCurrentCredential(EMPTY_CREDENTIALS);
          setIsEditingCredentials(true);
          setArticle(null);
          setImageBase64(null);
          setPodcastScript(null);
          setPodcastChapter('');
          setPodcastAudioBase64(null);
          setError(null);
          setProgressStep('IDLE');
          setPublishSuccessMessage(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to listen for credential changes from Firebase RTDB
  useEffect(() => {
    if (!user?.uid) {
        setSavedCredentials([]);
        return;
    }

    const unsubscribe = listenToCredentials(user.uid, (credentials) => {
        setSavedCredentials(credentials);
    });

    return () => unsubscribe();
  }, [user]);

  // Effect to automatically select a credential when the list changes (e.g., on load or after deletion)
  useEffect(() => {
    if (savedCredentials.length > 0 && !savedCredentials.some(c => c.id === selectedCredentialId)) {
        // If the current selection is invalid, select the first available credential
        const firstCredential = savedCredentials[0];
        setSelectedCredentialId(firstCredential.id);
        setCurrentCredential(firstCredential);
        setIsEditingCredentials(false);
    } else if (savedCredentials.length === 0) {
        // If there are no credentials, switch to "add new" mode
        setSelectedCredentialId('add_new');
        setCurrentCredential(EMPTY_CREDENTIALS);
        setIsEditingCredentials(true);
    }
  }, [savedCredentials, selectedCredentialId]);


  const handleAddNewClick = () => {
    setSelectedCredentialId('add_new');
    setCurrentCredential(EMPTY_CREDENTIALS);
    setIsEditingCredentials(true);
  };

  const handleSelectCredential = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCredentialId(id);
    const selected = savedCredentials.find(cred => cred.id === id);
    if (selected) {
        setCurrentCredential(selected);
    }
    // When switching to an existing credential, collapse the form by default.
    setIsEditingCredentials(false);
  };

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'applicationPassword' ? value.replace(/\s+/g, '') : value;
    setCurrentCredential(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const handleSaveCredentials = async () => {
    if (!user) {
        setError("Debes iniciar sesión para guardar blogs.");
        return;
    }
    if (!currentCredential.blogName || !currentCredential.siteUrl || !currentCredential.username || !currentCredential.applicationPassword) {
        setError("Por favor, completa todos los campos para guardar el blog.");
        return;
    }
    setError(null);
    
    try {
        if (selectedCredentialId !== 'add_new') { // Update existing
            await updateCredential(user.uid, { ...currentCredential, id: selectedCredentialId });
        } else { // Add new
            const newId = await saveCredential(user.uid, currentCredential);
            if (newId) {
                // Select the newly created credential. The useEffect will handle the rest.
                setSelectedCredentialId(newId);
            }
        }
        setIsEditingCredentials(false);
    } catch(e: any) {
        setError("Error al guardar en la base de datos: " + e.message);
    }
  };

  const handleDeleteCredential = async () => {
      if (!user || !selectedCredentialId || selectedCredentialId === 'add_new') return;
      if (window.confirm(`¿Estás seguro de que quieres eliminar el blog "${currentCredential.blogName}"?`)) {
        try {
            await deleteCredential(user.uid, selectedCredentialId);
            // The listener will automatically update the state, and the useEffect will reset the selection.
        } catch (e: any) {
            setError("Error al eliminar de la base de datos: " + e.message);
        }
      }
  };

  const handleGenerateFullContent = useCallback(async () => {
    if (!topic.trim()) {
      setError('Por favor, introduce un tema para el artículo.');
      return;
    }
    setError(null);
    setArticle(null);
    setImageBase64(null);
    setImagePrompt('');
    setPodcastScript(null);
    setPodcastAudioBase64(null);
    setPublishSuccessMessage(null);
    
    try {
      // Step 1: Generate Article
      setProgressStep('GENERATING_ARTICLE');
      const articleData = await generateArticle(topic);
      setArticle(articleData);

      // Step 2: Generate Image (prompt + image data)
      setProgressStep('GENERATING_IMAGE');
      const prompt = await createImagePrompt(articleData.content);
      setImagePrompt(prompt);
      const generatedImage = await generateImage(prompt);
      setImageBase64(generatedImage);

      setProgressStep('IDLE');
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error durante la generación de contenido.');
      setProgressStep('ERROR');
    }
  }, [topic]);

  const handleRegenerateImage = useCallback(async () => {
    if (!imagePrompt) return;
    setIsRegeneratingImage(true);
    setError(null);
    try {
        const generatedImage = await generateImage(imagePrompt);
        setImageBase64(generatedImage);
    } catch (e: any) {
        setError(e.message || 'Ocurrió un error al regenerar la imagen.');
    } finally {
        setIsRegeneratingImage(false);
    }
  }, [imagePrompt]);


  const handleGeneratePodcastScript = useCallback(async () => {
    if (!article) return;
    setIsLoadingPodcastScript(true);
    setError(null);
    setPodcastAudioBase64(null); // Clear previous audio
    try {
        const script = await generatePodcastScript(article.content, podcastChapter);
        setPodcastScript(script);
    } catch (e: any) {
        setError(e.message || 'Ocurrió un error al generar el guion del podcast.');
    } finally {
        setIsLoadingPodcastScript(false);
    }
  }, [article, podcastChapter]);

  const handleCopyScript = useCallback(() => {
    if (!podcastScript) return;
    navigator.clipboard.writeText(podcastScript).then(() => {
        setIsScriptCopied(true);
        setTimeout(() => setIsScriptCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        setError('No se pudo copiar el guion al portapapeles.');
    });
  }, [podcastScript]);

  const handleGeneratePodcastAudio = useCallback(async () => {
    if (!podcastScript) return;
    setIsLoadingPodcastAudio(true);
    setPodcastAudioBase64(null);
    setError(null);
    try {
        const audioBase64 = await generatePodcastAudio(podcastScript);
        setPodcastAudioBase64(audioBase64);
    } catch (e: any) {
        setError(e.message || 'Ocurrió un error al generar el audio del podcast.');
    } finally {
        setIsLoadingPodcastAudio(false);
    }
  }, [podcastScript]);

  const handlePublish = useCallback(async () => {
    const activeCredentials = savedCredentials.find(c => c.id === selectedCredentialId);
    if (!article || !activeCredentials) {
      setError('Por favor, selecciona un blog, completa sus datos y genera un artículo antes de publicar.');
      return;
    }
    setError(null);
    setPublishSuccessMessage(null);
    
    try {
      let featuredMediaId: number | null = null;
      if (imageBase64) {
        setProgressStep('UPLOADING_IMAGE');
        const mediaResponse = await uploadImage(activeCredentials, imageBase64, article.title);
        featuredMediaId = mediaResponse.id;
      }

      setProgressStep('PUBLISHING_POST');
      const htmlContent = marked.parse(article.content);
      
      const postResponse = await publishPost(activeCredentials, article.title, htmlContent, featuredMediaId);
      setProgressStep('SUCCESS');
      setPublishSuccessMessage(`¡Éxito! Artículo publicado en: ${postResponse.link}`);
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error al publicar en WordPress.');
      setProgressStep('ERROR');
    }
  }, [article, imageBase64, savedCredentials, selectedCredentialId]);


  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                Generador de Artículos
            </h1>
            <p className="mt-1 text-md text-gray-400">Crea y publica contenido con IA.</p>
          </div>
          <div className="flex items-center gap-4">
              {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />}
              <button onClick={signOut} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition-colors">
                Salir
              </button>
          </div>
        </header>

        <main className="space-y-8">
          {/* WordPress Configuration */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><WordPressIcon className="w-7 h-7 mr-3 text-blue-400"/>Configuración de WordPress</h2>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                <select 
                    value={selectedCredentialId} 
                    onChange={handleSelectCredential}
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]"
                    aria-label="Seleccionar blog de WordPress"
                    disabled={savedCredentials.length === 0}
                >
                    {savedCredentials.length > 0 
                      ? savedCredentials.map(cred => <option key={cred.id} value={cred.id}>{cred.blogName}</option>)
                      : <option value="" disabled>Añade tu primer blog</option>
                    }
                </select>
                <div className="flex gap-2 items-center">
                    <button onClick={handleAddNewClick} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors text-sm">
                        Añadir Nuevo
                    </button>
                    {savedCredentials.length > 0 && selectedCredentialId !== 'add_new' && (
                        <>
                            <button onClick={() => setIsEditingCredentials(prev => !prev)} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Editar credenciales"><EditIcon /></button>
                            <button onClick={handleDeleteCredential} className="p-2 text-red-500 hover:text-red-400 transition-colors" aria-label="Eliminar credenciales"><TrashIcon /></button>
                        </>
                    )}
                </div>
            </div>

            {isEditingCredentials && (
                <div className="mt-4 space-y-4 pt-4 border-t border-gray-700/50">
                    <input type="text" name="blogName" placeholder="Nombre del Blog (ej. Mi Blog de Viajes)" value={currentCredential.blogName} onChange={handleCredentialChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="siteUrl" placeholder="URL de tu sitio (ej. https://misitio.com)" value={currentCredential.siteUrl} onChange={handleCredentialChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <input type="text" name="username" placeholder="Usuario de WordPress" value={currentCredential.username} onChange={handleCredentialChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                    </div>
                    <input type="password" name="applicationPassword" placeholder="Contraseña de Aplicación" value={currentCredential.applicationPassword} onChange={handleCredentialChange} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                    <button onClick={handleSaveCredentials} className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                        {selectedCredentialId === 'add_new' ? 'Añadir Blog' : 'Actualizar Blog'}
                    </button>
                </div>
            )}
             <div className="text-xs text-gray-500 mt-3 space-y-1">
                <p>
                    <strong className="text-gray-400">Contraseña de Aplicación:</strong> No uses tu contraseña principal. Ve a tu Perfil de WordPress &rarr; Contraseñas de Aplicación para crear una. Las contraseñas no tienen espacios.
                </p>
                <p>
                    <strong className="text-gray-400">Error de CORS:</strong> Si la publicación falla, es posible que necesites un plugin de WordPress como <a href="https://wordpress.org/plugins/wp-cors/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">WP CORS</a> para permitir las solicitudes desde esta aplicación.
                </p>
            </div>
          </div>

          {/* Article Generation */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">1. Genera tu Artículo</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Escribe el tema de tu artículo aquí..." value={topic} onChange={(e) => setTopic(e.target.value)} className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <button onClick={handleGenerateFullContent} disabled={isProcessRunning} className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition-colors duration-300">
                {generationSteps.includes(progressStep)
                    ? <LoadingSpinner /> 
                    : <SparklesIcon className="w-5 h-5 mr-2"/>
                }
                {generationSteps.includes(progressStep) ? 'Generando...' : 'Generar Artículo'}
              </button>
            </div>
            <ProgressTracker currentStep={progressStep} isPublishingFlow={false} />
          </div>

          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md whitespace-pre-wrap">{error}</div>}
          
          {/* Content Display and Publishing */}
          {article && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 space-y-6">
              <h2 className="text-2xl font-bold">2. Revisa y Publica</h2>
              
              {/* Image Section */}
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Imagen Destacada</h3>
                <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {imageBase64 ? (
                        <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Imagen generada para el artículo" className="w-full h-full object-cover" />
                    ) : (
                        progressStep === 'GENERATING_IMAGE' ? <LoadingSpinner /> : <p className="text-gray-400">La imagen aparecerá aquí</p>
                    )}
                </div>
                {imagePrompt && (
                    <div className="mt-4 space-y-2">
                        <label htmlFor="image-prompt-input" className="block text-sm font-medium text-gray-400">
                            Prompt de la Imagen (puedes editarlo y regenerar)
                        </label>
                        <textarea
                            id="image-prompt-input"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            className="w-full h-24 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-200"
                            disabled={isRegeneratingImage}
                            aria-label="Prompt de la imagen"
                        />
                        <button 
                            onClick={handleRegenerateImage} 
                            disabled={isProcessRunning || isRegeneratingImage || !imagePrompt} 
                            className="flex justify-center items-center w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                        >
                        {isRegeneratingImage ? <LoadingSpinner /> : <ImageIcon className="w-5 h-5 mr-2" />}
                        {isRegeneratingImage ? 'Generando...' : 'Regenerar Imagen'}
                        </button>
                    </div>
                )}
              </div>

              {/* Article Content */}
              <div className="p-4 bg-gray-900 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Contenido del Artículo</h3>
                <div className="prose prose-invert max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-p:text-gray-300 prose-strong:text-white prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: marked.parse(article.content) }}>
                </div>
              </div>

              {/* Podcast Script Section */}
              <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold">Guion para Podcast</h3>
                    {podcastScript && (
                        <button 
                            onClick={handleCopyScript} 
                            className="relative group p-2 text-gray-400 hover:text-white transition-colors"
                            aria-label="Copiar guion"
                        >
                            {isScriptCopied 
                                ? <CheckIcon className="w-5 h-5 text-green-400" /> 
                                : <CopyIcon className="w-5 h-5" />
                            }
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {isScriptCopied ? '¡Copiado!' : 'Copiar Guion'}
                            </span>
                        </button>
                    )}
                  </div>
                  <div className="space-y-4">
                     <input 
                        type="text" 
                        placeholder="Número de capítulo (opcional)" 
                        value={podcastChapter} 
                        onChange={(e) => setPodcastChapter(e.target.value)} 
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none" 
                     />
                    <button
                        onClick={handleGeneratePodcastScript}
                        disabled={isLoadingPodcastScript}
                        className="flex justify-center items-center w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                    >
                        {isLoadingPodcastScript ? <LoadingSpinner /> : <MicrophoneIcon className="w-5 h-5 mr-2" />}
                        {isLoadingPodcastScript ? 'Generando Guion...' : (podcastScript ? 'Generar de Nuevo' : 'Generar Guion')}
                    </button>
                  </div>
                  {podcastScript && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                         <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-strong:text-white"
                             dangerouslySetInnerHTML={{ __html: marked.parse(podcastScript) }}>
                         </div>
                         <div className="mt-4 space-y-4">
                            <button
                                onClick={handleGeneratePodcastAudio}
                                disabled={isLoadingPodcastAudio}
                                className="flex justify-center items-center w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                            >
                                {isLoadingPodcastAudio ? <LoadingSpinner /> : <SoundWaveIcon className="w-5 h-5 mr-2" />}
                                {isLoadingPodcastAudio ? 'Generando Audio...' : 'Generar Audio del Podcast'}
                            </button>
                            {podcastAudioBase64 && (
                                <audio controls className="w-full" src={`data:audio/mp3;base64,${podcastAudioBase64}`}>
                                    Tu navegador no soporta el elemento de audio.
                                </audio>
                            )}
                         </div>
                      </div>
                  )}
              </div>

              {/* Grounding Sources */}
              {article.sources.length > 0 && (
                <div className="p-4 bg-gray-900 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3">Fuentes de Investigación</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {article.sources.map((source, index) => source.web && (
                            <li key={index}>
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{source.web.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>
              )}

              {/* Publish Button */}
              <div className="pt-4 border-t border-gray-700">
                <button onClick={handlePublish} disabled={isProcessRunning} className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 text-lg">
                  {publishingSteps.includes(progressStep) ? <LoadingSpinner /> : <WordPressIcon className="w-6 h-6 mr-3" />}
                  {publishingSteps.includes(progressStep) ? 'Publicando...' : 'Publicar en WordPress'}
                </button>
                <ProgressTracker currentStep={progressStep} isPublishingFlow={true} />
                {publishSuccessMessage && <div className="mt-4 text-center text-green-400">{publishSuccessMessage}</div>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

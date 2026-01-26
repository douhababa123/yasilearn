import React, { useState, useEffect } from 'react';
import { Volume2, Bookmark, BookOpen, Search, X, Minus, Check, Loader2, Tag, ChevronRight, Image as ImageIcon, Database, Download } from 'lucide-react';
import { VocabItem, evaluatePronunciation, getWordInsights, PronunciationAssessment, WordInsight } from '../services/ai';
import { Link } from 'react-router-dom';

// Extend VocabItem to include DB fields
interface VocabItemWithMeta extends VocabItem {
  id: number;
  status: string; // 'new' | 'learning' | 'reviewing' | 'mastered'
  next_review_at: string;
}

interface VocabCardProps {
  item: VocabItemWithMeta;
  onPronounce: (word: string) => void;
  isSpeaking: boolean;
  isRevealed: boolean;
  onToggleReveal: () => void;
  clozeSentence: string | null;
  onStartFollowRead: () => void;
  followReadState: FollowReadState | null;
  followReadProgress: FollowReadProgress | null;
}

type FollowReadRating = 'bad' | 'poor' | 'ok' | 'good' | 'perfect';

type FollowReadState = {
  status: 'idle' | 'listening' | 'processing' | 'done' | 'error';
  transcript?: string;
  score?: number;
  rating?: FollowReadRating;
  feedback?: string;
  error?: string;
  issues?: string[];
};

type FollowReadProgress = {
  previous: FollowReadRating;
  current: FollowReadRating;
  improved: boolean;
};

const VocabCard: React.FC<VocabCardProps> = ({
  item,
  onPronounce,
  isSpeaking,
  isRevealed,
  onToggleReveal,
  clozeSentence,
  onStartFollowRead,
  followReadState,
  followReadProgress
}) => {
  return (
     <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Card Header */}
        <div className="p-8 sm:p-10 pb-6 flex justify-between items-start">
           <div>
              <div className="flex items-center gap-4 mb-3">
                 <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">{item.word}</h1>
                 <button
                   onClick={() => onPronounce(item.word)}
                   aria-label={`Pronounce ${item.word}`}
                   className={`size-10 sm:size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-colors ${
                     isSpeaking ? 'bg-primary/20' : 'hover:bg-primary/20'
                   }`}
                 >
                    <Volume2 size={24} />
                 </button>
                 <button
                   onClick={onStartFollowRead}
                   className="px-3 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                 >
                   跟读评分
                 </button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-sm font-medium font-mono border border-slate-200">{item.phonetic}</span>
                 <div className="flex gap-2">
                    {item.tags?.map(tag => (
                        <span key={tag} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-blue-100">
                          <Tag size={10} /> {tag}
                        </span>
                    ))}
                 </div>
                 {/* Difficulty Dots */}
                 <div className="flex gap-1 ml-2" title={`Difficulty: ${item.difficulty}/5`}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < item.difficulty ? 'bg-orange-400' : 'bg-slate-200'}`} />
                    ))}
                 </div>
              </div>
           </div>
           <Bookmark className="text-slate-200 text-4xl sm:text-5xl fill-current hover:text-primary transition-colors cursor-pointer" />
        </div>
        
        <div className="w-full h-px bg-slate-100"></div>

        <div className="px-8 sm:px-10 py-6 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Active Recall Mode
            </div>
            <button
              onClick={onToggleReveal}
              className="px-4 py-2 rounded-full border border-slate-200 bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              {isRevealed ? 'Hide Answer' : 'Show Answer'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Press space to reveal or hide the answer.</p>
        </div>

        {isRevealed && (
          <>
            {followReadState && (
              <div className="px-8 sm:px-10 py-4 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pronunciation Result</p>
                    {followReadState.status === 'listening' && (
                      <p className="text-sm text-slate-600 font-medium mt-1">正在录音，请朗读单词…</p>
                    )}
                    {followReadState.status === 'processing' && (
                      <p className="text-sm text-slate-600 font-medium mt-1">正在评估发音…</p>
                    )}
                    {followReadState.status === 'done' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-700 font-medium">
                          评分：<span className="font-bold">{followReadState.rating}</span>（{followReadState.score})
                        </p>
                        {followReadState.transcript && (
                          <p className="text-xs text-slate-500">识别结果：{followReadState.transcript}</p>
                        )}
                        {followReadState.feedback && (
                          <p className="text-xs text-slate-500">提示：{followReadState.feedback}</p>
                        )}
                        {followReadState.issues && followReadState.issues.length > 0 && (
                          <p className="text-xs text-slate-500">可能问题：{followReadState.issues.join('、')}</p>
                        )}
                      </div>
                    )}
                    {followReadState.status === 'error' && (
                      <p className="text-sm text-red-500 mt-1">{followReadState.error}</p>
                    )}
                  </div>
                  {followReadProgress && (
                    <div className="text-xs text-slate-500">
                      变化：{followReadProgress.previous} → {followReadProgress.current}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Definition Area */}
            <div className="px-8 sm:px-10 py-6 bg-white">
               <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                       <BookOpen size={14} /> Definition
                     </p>
                     <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed">
                       {item.definition}
                     </p>
                  </div>
                  
                  {/* Image Rendering Logic */}
                  {item.imageUrl && (
                    <div className="shrink-0 w-full sm:w-48 h-32 sm:h-32 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative group">
                      <img 
                        src={item.imageUrl} 
                        alt={item.word} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </div>
                  )}
               </div>
            </div>

            {clozeSentence && (
              <div className="px-8 sm:px-10 py-4 bg-slate-50 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cloze Practice</p>
                <p className="text-base text-slate-700 font-medium">{clozeSentence}</p>
              </div>
            )}

            {/* Examples Section */}
            <div className="bg-slate-50 border-t border-slate-100 px-8 sm:px-10 py-8 flex-1">
               <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Context Examples</span>
               </div>
               <div className="space-y-6">
                  {item.examples?.map((ex, idx) => (
                    <div key={idx} className="flex gap-4 group">
                        <div className="w-1 bg-primary/30 rounded-full group-hover:bg-primary transition-colors shrink-0 mt-1.5 h-full min-h-[40px]"></div>
                        <div>
                            <p className="text-base text-slate-700 leading-relaxed mb-1 font-medium">
                                "{ex.en}"
                            </p>
                            <p className="text-sm text-slate-500 font-sans">
                                {ex.cn}
                            </p>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          </>
        )}
     </div>
  );
}

export const Vocabulary = () => {
  const [vocabList, setVocabList] = useState<VocabItemWithMeta[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [followReadState, setFollowReadState] = useState<FollowReadState | null>(null);
  const [followReadProgress, setFollowReadProgress] = useState<FollowReadProgress | null>(null);
  const [wordInsight, setWordInsight] = useState<WordInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // FIXED: Removed localhost:3001, used relative path to allow proxying
        const response = await fetch('/api/vocab');
        if (!response.ok) {
           throw new Error('Failed to connect to backend');
        }
        const data = await response.json();
        setVocabList(data);
      } catch (err) {
        console.error("Failed to load vocab:", err);
        setError("Could not load vocabulary. Ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setIsRevealed(false);
  }, [selectedIndex, searchQuery]);

  useEffect(() => {
    setFollowReadState(null);
    setFollowReadProgress(null);
    setWordInsight(null);
    setInsightError(null);
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        setIsRevealed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReview = async (quality: number) => {
    const currentItem = vocabList[selectedIndex];
    if (!currentItem) return;

    // Optimistically move to next card
    if (vocabList.length > 1) {
       setSelectedIndex((prev) => (prev + 1) % vocabList.length);
    }

    setReviewing(true);
    try {
        // FIXED: Removed localhost:3001
        await fetch(`/api/vocab/${currentItem.id}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quality })
        });
        // In a real app, we might re-fetch or update the list status locally
    } catch (err) {
        console.error("Failed to submit review", err);
    } finally {
        setReviewing(false);
    }
  };

  const filteredList = vocabList.filter(v => v.word.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentItem = filteredList[selectedIndex] || filteredList[0];

  // Calculate Stats
  const masteredCount = vocabList.filter(v => v.status === 'mastered').length;
  const learningCount = vocabList.filter(v => v.status === 'learning' || v.status === 'new').length;
  const reviewingCount = vocabList.filter(v => v.status === 'reviewing').length;
  const todayDueCount = vocabList.filter(v => !v.next_review_at || new Date(v.next_review_at) <= new Date()).length;

  const exportToCsv = () => {
    if (vocabList.length === 0) return;

    const headers = [
      'id',
      'word',
      'phonetic',
      'definition',
      'image_url',
      'difficulty',
      'tags',
      'status',
      'next_review_at',
      'examples'
    ];

    const escapeCsv = (value: string | number | null | undefined) => {
      const stringValue = value === null || value === undefined ? '' : String(value);
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = vocabList.map(item => {
      const examples = (item.examples || [])
        .map(ex => `${ex.en} || ${ex.cn}`)
        .join(' | ');

      return [
        item.id,
        item.word,
        item.phonetic,
        item.definition,
        item.imageUrl || '',
        item.difficulty,
        (item.tags || []).join('|'),
        item.status,
        item.next_review_at,
        examples
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vocabulary_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePronounce = (word: string) => {
    if (!word) return;
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const calculateDistance = (a: string, b: string) => {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  const scorePronunciation = (target: string, transcript: string) => {
    const normalizedTarget = target.toLowerCase().trim();
    const normalizedTranscript = transcript.toLowerCase().trim();
    const distance = calculateDistance(normalizedTarget, normalizedTranscript);
    const maxLen = Math.max(normalizedTarget.length, normalizedTranscript.length, 1);
    const score = Math.max(0, Math.round(100 * (1 - distance / maxLen)));
    let rating: FollowReadRating = 'bad';
    if (score >= 90) rating = 'perfect';
    else if (score >= 80) rating = 'good';
    else if (score >= 65) rating = 'ok';
    else if (score >= 50) rating = 'poor';
    else rating = 'bad';
    return { score, rating };
  };

  const getHistoryKey = (word: string) => `pronunciationHistory:${word.toLowerCase()}`;

  const updatePronunciationHistory = (word: string, rating: FollowReadRating) => {
    const key = getHistoryKey(word);
    const raw = localStorage.getItem(key);
    const history = raw ? (JSON.parse(raw) as FollowReadRating[]) : [];
    const hasBad = history.some(entry => entry === 'bad' || entry === 'poor');

    if (rating === 'bad' || rating === 'poor') {
      history.push(rating);
      localStorage.setItem(key, JSON.stringify(history));
      return { previous: rating, current: rating, improved: false };
    }

    if (hasBad && (rating === 'good' || rating === 'perfect')) {
      const previous = history[history.length - 1] || 'bad';
      history.push(rating);
      localStorage.setItem(key, JSON.stringify(history));
      return { previous, current: rating, improved: true };
    }

    return null;
  };

  const startFollowRead = () => {
    const word = currentItem?.word;
    if (!word) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFollowReadState({
        status: 'error',
        error: '当前浏览器不支持语音识别，请使用 Chrome 或 Edge。'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setFollowReadState({ status: 'listening' });

    let hasResult = false;
    recognition.onresult = async (event: any) => {
      hasResult = true;
      const transcript = event.results[0][0].transcript;
      setFollowReadState({ status: 'processing' });
      let assessment: PronunciationAssessment | null = null;
      try {
        assessment = await evaluatePronunciation(word, transcript);
      } catch (err) {
        console.warn('AI evaluation failed, falling back to local score.', err);
      }
      const localScore = scorePronunciation(word, transcript);
      const rating = assessment?.rating ?? localScore.rating;
      const score = assessment?.score ?? localScore.score;
      const progress = updatePronunciationHistory(word, rating);
      setFollowReadProgress(progress);
      setFollowReadState({
        status: 'done',
        transcript,
        score,
        rating,
        feedback: assessment?.feedback || (rating === 'perfect'
          ? '发音非常标准，保持！'
          : '可以尝试放慢语速并注意重音。'),
        issues: assessment?.issues
      });
    };

    recognition.onerror = () => {
      setFollowReadState({
        status: 'error',
        error: '识别失败，请重试并确保麦克风权限已开启。'
      });
    };

    recognition.onend = () => {
      if (!hasResult) {
        setFollowReadState({
          status: 'error',
          error: '未检测到语音输入，请重试。'
        });
      }
    };

    recognition.start();
  };

  const loadWordInsight = async () => {
    if (!currentItem?.word) return;
    setInsightLoading(true);
    setInsightError(null);
    try {
      const result = await getWordInsights(currentItem.word);
      setWordInsight(result);
    } catch (err) {
      setInsightError('AI 解析失败，请稍后重试。');
      console.error(err);
    } finally {
      setInsightLoading(false);
    }
  };

  const clozeSentence = (() => {
    const example = currentItem?.examples?.[0]?.en;
    if (!example || !currentItem?.word) return null;
    const escapedWord = currentItem.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    if (!regex.test(example)) return null;
    const blank = '_'.repeat(Math.max(currentItem.word.length, 4));
    return example.replace(regex, blank);
  })();

  return (
    <div className="flex h-screen bg-[#f6f6f8] overflow-hidden">
       {/* Left Sidebar List */}
       <div className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-5 border-b border-slate-100">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">My Vocabulary</h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{vocabList.length} words</span>
             </div>
             <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search collection..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-sm">All</button>
                <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 whitespace-nowrap">New</button>
                <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 whitespace-nowrap">Due</button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             {loading ? (
               <div className="p-8 flex justify-center">
                 <Loader2 size={24} className="animate-spin text-slate-300" />
               </div>
             ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-500 text-sm font-medium mb-2">{error}</p>
                </div>
             ) : vocabList.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                   <Database size={32} className="mx-auto mb-3 opacity-20" />
                   <p className="text-sm">Your database is empty.</p>
                   <Link to="/settings" className="text-xs text-primary font-bold hover:underline mt-2 block">Go to Data Import</Link>
                </div>
             ) : (
               filteredList.map((item, idx) => {
                 const isActive = currentItem?.word === item.word;
                 return (
                    <div 
                        key={item.id || idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`group px-5 py-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative ${isActive ? 'bg-blue-50/50' : ''}`}
                    >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                        <div className="flex justify-between items-center mb-1">
                            <h4 className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-slate-900 group-hover:text-primary transition-colors'}`}>{item.word}</h4>
                            <div className="flex items-center gap-1">
                                {item.status === 'mastered' && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                                {item.status === 'reviewing' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>}
                                {item.difficulty >= 4 && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-bold">Hard</span>}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 truncate pr-4">{item.definition}</p>
                        {item.imageUrl && (
                          <ImageIcon size={12} className="absolute right-4 bottom-4 text-slate-300" />
                        )}
                        <ChevronRight size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-primary' : ''}`} />
                    </div>
                 );
               })
             )}
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto flex flex-col items-center py-8 px-4 relative scroll-smooth">
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium">Loading vocabulary deck...</p>
             </div>
          ) : !currentItem ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No words found matching "{searchQuery}"</p>
                {vocabList.length === 0 && <p className="text-sm mt-2">Use the Import Tool to add words.</p>}
             </div>
          ) : (
            <>
              <div className="w-full max-w-3xl flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="cursor-pointer hover:text-primary font-medium">IELTS Academic</span> 
                    <span className="text-xs text-slate-300">›</span> 
                    <span className="text-slate-900 font-bold">Flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                      onClick={exportToCsv}
                      disabled={vocabList.length === 0}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        currentItem.status === 'mastered' ? 'bg-green-100 text-green-700' :
                        currentItem.status === 'reviewing' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {currentItem.status || 'New'}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-slate-600">
                        Card {selectedIndex + 1} <span className="text-slate-400 font-normal">of</span> {filteredList.length}
                    </div>
                </div>
              </div>
              
              <VocabCard
                item={currentItem}
                onPronounce={handlePronounce}
                isSpeaking={isSpeaking}
                isRevealed={isRevealed}
                onToggleReveal={() => setIsRevealed(prev => !prev)}
                clozeSentence={clozeSentence}
                onStartFollowRead={startFollowRead}
                followReadState={followReadState}
                followReadProgress={followReadProgress}
              />

              {/* Review Actions (Spaced Repetition) */}
              <div className="mt-8 grid grid-cols-4 gap-4 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                <button 
                    onClick={() => handleReview(1)}
                    disabled={reviewing}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-100 bg-white hover:bg-red-50 text-red-600 transition-all h-24 active:scale-95 group shadow-sm hover:shadow-md disabled:opacity-50"
                >
                    <X className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Forgot</span>
                    <span className="text-[10px] opacity-60 mt-1 font-medium">Review &lt;10m</span>
                </button>
                <button 
                    onClick={() => handleReview(2)}
                    disabled={reviewing}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-orange-100 bg-white hover:bg-orange-50 text-orange-600 transition-all h-24 active:scale-95 group shadow-sm hover:shadow-md disabled:opacity-50"
                >
                    <Minus className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Hard</span>
                    <span className="text-[10px] opacity-60 mt-1 font-medium">Review 1h</span>
                </button>
                <button 
                    onClick={() => handleReview(3)}
                    disabled={reviewing}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-white hover:bg-blue-50 text-blue-600 transition-all h-24 active:scale-95 group shadow-sm hover:shadow-md disabled:opacity-50"
                >
                    <Check className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Good</span>
                    <span className="text-[10px] opacity-60 mt-1 font-medium">Review 6h</span>
                </button>
                <button 
                    onClick={() => handleReview(5)}
                    disabled={reviewing}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all h-24 active:scale-95 group disabled:opacity-50"
                >
                    <Check className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">Easy</span>
                    <span className="text-[10px] opacity-80 mt-1 font-medium">Review 1d</span>
                </button>
              </div>
              <div className="mt-6 w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">词根联想 & 相似词对比</h3>
                  <button
                    onClick={loadWordInsight}
                    disabled={insightLoading}
                    className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {insightLoading ? '生成中...' : 'AI 生成'}
                  </button>
                </div>
                {insightError && <p className="text-xs text-red-500">{insightError}</p>}
                {wordInsight ? (
                  <div className="space-y-4 text-sm text-slate-700">
                    {wordInsight.root && (
                      <div>
                        <p className="font-semibold">词根联想</p>
                        <p className="text-slate-600">{wordInsight.root}</p>
                        {wordInsight.rootExplanation && (
                          <p className="text-slate-500 text-xs mt-1">{wordInsight.rootExplanation}</p>
                        )}
                      </div>
                    )}
                    {wordInsight.memoryHook && (
                      <div>
                        <p className="font-semibold">记忆钩子</p>
                        <p className="text-slate-600">{wordInsight.memoryHook}</p>
                      </div>
                    )}
                    {wordInsight.similarWords?.length > 0 && (
                      <div>
                        <p className="font-semibold">相似词对比</p>
                        <ul className="mt-2 space-y-2">
                          {wordInsight.similarWords.map((item, index) => (
                            <li key={`${item.word}-${index}`} className="text-slate-600">
                              <span className="font-semibold">{item.word}</span>：{item.meaning}
                              {item.difference && <span className="text-xs text-slate-500">（{item.difference}）</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {wordInsight.contrast && (
                      <div>
                        <p className="font-semibold">对比学习</p>
                        <p className="text-slate-600">{wordInsight.contrast}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">点击“AI 生成”获取词根联想与相似词对比。</p>
                )}
              </div>
            </>
          )}
       </div>

       {/* Right Sidebar (Stats) - Only visible on large screens */}
       <div className="w-80 bg-white border-l border-slate-200 hidden xl:flex flex-col p-6 shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Session Progress
          </h3>
          <div className="flex flex-col items-center justify-center mb-8 relative">
             <div className="size-48 relative">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                   <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                   <path className="text-primary transition-all duration-500 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${filteredList.length ? ((selectedIndex + 1) / filteredList.length) * 100 : 0}, 100`} strokeLinecap="round" strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black text-slate-900">{filteredList.length ? Math.round(((selectedIndex + 1) / filteredList.length) * 100) : 0}<span className="text-lg text-slate-400">%</span></span>
                   <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Completed</span>
                </div>
             </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 flex items-center justify-between border border-orange-100 mb-6 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-16 h-16 bg-orange-200/20 rounded-full blur-xl -mr-4 -mt-4"></div>
             <div className="flex items-center gap-3 relative z-10">
                <div className="size-10 rounded-lg bg-white text-orange-500 flex items-center justify-center shadow-sm text-lg">🔥</div>
                <div>
                   <p className="text-sm font-bold text-slate-900">Day Streak</p>
                   <p className="text-xs text-orange-600 font-medium">Keep it up!</p>
                </div>
             </div>
             <span className="text-2xl font-black text-orange-500 relative z-10">12</span>
          </div>
          
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deck Stats</h4>
             <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                 <span className="text-slate-600 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                   Today Due
                 </span>
                 <span className="font-bold text-slate-900">{todayDueCount}</span>
             </div>
             {[
               { label: 'Mastered', count: masteredCount, color: 'bg-green-500' },
               { label: 'Learning', count: learningCount, color: 'bg-blue-500' },
               { label: 'Reviewing', count: reviewingCount, color: 'bg-orange-500' }
             ].map((stat, i) => (
               <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3 last:border-0">
                   <span className="text-slate-600 flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${stat.color} ring-4 ring-${stat.color.replace('bg-', '')}/10`}></div>
                     {stat.label}
                   </span>
                   <span className="font-bold text-slate-900">{stat.count}</span>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

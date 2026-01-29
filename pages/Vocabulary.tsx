import React, { useState, useEffect } from 'react';
import { Volume2, Bookmark, BookOpen, Search, X, Minus, Check, Loader2, Tag, ChevronRight, Image as ImageIcon, Database, Download, Sparkles, Clock, Flame, TrendingUp } from 'lucide-react';
import { VocabItem, evaluatePronunciation, getWordInsights, PronunciationAssessment, WordInsight } from '../services/ai';
import { Link } from 'react-router-dom';

interface VocabItemWithMeta extends VocabItem {
  id: number;
  status: string;
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
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 border border-slate-100">
      <div className="p-10 pb-8 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tight text-slate-900">{item.word}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPronounce(item.word)}
                className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <Volume2 size={24} />
              </button>
              <button
                onClick={onStartFollowRead}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                跟读
              </button>
            </div>
          </div>
          <Bookmark className="text-slate-200 text-5xl fill-current hover:text-primary transition-colors cursor-pointer" />
        </div>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-xl text-sm font-mono font-bold border border-slate-200">{item.phonetic}</span>
          <div className="flex gap-2">
            {item.tags?.map(tag => (
              <span key={tag} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-blue-100">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-1 ml-2" title={`Difficulty: ${item.difficulty}/5`}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < item.difficulty ? 'bg-orange-400' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={onToggleReveal}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all active:scale-98"
          >
            {isRevealed ? '隐藏答案 (空格)' : '显示答案 (空格)'}
          </button>
        </div>
      </div>

      {isRevealed && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {followReadState && (
            <div className="px-10 py-5 bg-gradient-to-r from-slate-50 to-blue-50 border-y border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">发音评分</p>
                  {followReadState.status === 'listening' && (
                    <p className="text-slate-600 font-medium">正在录音，请朗读单词…</p>
                  )}
                  {followReadState.status === 'processing' && (
                    <p className="text-slate-600 font-medium">正在评估发音…</p>
                  )}
                  {followReadState.status === 'done' && (
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-slate-800">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                          followReadState.rating === 'perfect' ? 'bg-green-100 text-green-700' :
                          followReadState.rating === 'good' ? 'bg-blue-100 text-blue-700' :
                          followReadState.rating === 'ok' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {followReadState.rating?.toUpperCase()} ({followReadState.score})
                        </span>
                      </p>
                      {followReadState.transcript && (
                        <p className="text-sm text-slate-500">识别结果：{followReadState.transcript}</p>
                      )}
                    </div>
                  )}
                  {followReadState.status === 'error' && (
                    <p className="text-red-500 text-sm">{followReadState.error}</p>
                  )}
                </div>
                {followReadProgress && (
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">进步</p>
                    <p className="text-sm font-bold text-slate-600">
                      {followReadProgress.previous} → <span className={followReadProgress.improved ? 'text-green-600' : 'text-slate-800'}>{followReadProgress.current}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-10 pt-8 bg-white">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Definition</span>
                </div>
                <p className="text-2xl font-medium text-slate-800 leading-relaxed">
                  {item.definition}
                </p>
              </div>

              {item.imageUrl && (
                <div className="shrink-0 w-full sm:w-48 h-48 rounded-2xl overflow-hidden border border-slate-200 relative group">
                  <img
                    src={item.imageUrl}
                    alt={item.word}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {clozeSentence && (
            <div className="px-10 py-5 bg-amber-50 border-t border-amber-100">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Cloze Practice</p>
              <p className="text-lg text-slate-700 font-medium font-mono">{clozeSentence}</p>
            </div>
          )}

          <div className="bg-gradient-to-b from-slate-50 to-white px-10 py-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Context Examples</span>
            </div>
            <div className="space-y-6">
              {item.examples?.map((ex, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="w-1.5 bg-primary/30 rounded-full group-hover:bg-primary transition-colors shrink-0 mt-1.5 h-full min-h-[50px]"></div>
                  <div>
                    <p className="text-lg text-slate-700 leading-relaxed font-medium mb-2">
                      "{ex.en}"
                    </p>
                    <p className="text-base text-slate-500">{ex.cn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface QuizQuestion {
  question?: string;
  questionCn?: string;
  word?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  englishExplanation?: string;
}

const QuizSection: React.FC<{ quizzes: QuizQuestion[] }> = ({ quizzes }) => {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: quizzes.length });

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    if (answerIndex === quizzes[currentQuiz].correctAnswer) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  const nextQuiz = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const prevQuiz = () => {
    if (currentQuiz > 0) {
      setCurrentQuiz(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, total: quizzes.length });
  };

  const quiz = quizzes[currentQuiz];
  const isCorrect = selectedAnswer === quiz.correctAnswer;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          练习 ({currentQuiz + 1}/{quizzes.length})
        </span>
        <span className={`text-sm font-bold ${score.correct / score.total >= 0.7 ? 'text-green-600' : 'text-orange-600'}`}>
          正确率: {Math.round(score.correct / score.total * 100)}%
        </span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500" style={{ width: `${((currentQuiz + 1) / quizzes.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
          {quiz.questionCn && <p className="text-base text-slate-600 mb-2">{quiz.questionCn}</p>}
          {quiz.question ? (
            <p className="text-lg font-medium text-slate-800">{quiz.question}</p>
          ) : (
            <p className="text-lg font-medium text-slate-800">
              选择与 <span className="text-primary font-bold">{quiz.word}</span> 意思最相近的词：
            </p>
          )}
        </div>

        <div className="p-6 space-y-3">
          {quiz.options.map((option, idx) => {
            let optionClass = 'border-slate-200 hover:border-primary/50 hover:bg-slate-50';
            let indicatorClass = 'border-slate-300 bg-white';

            if (showResult) {
              if (idx === quiz.correctAnswer) {
                optionClass = 'border-green-500 bg-green-50';
                indicatorClass = 'bg-green-500 border-green-500';
              } else if (idx === selectedAnswer && !isCorrect) {
                optionClass = 'border-red-500 bg-red-50';
                indicatorClass = 'bg-red-500 border-red-500';
              }
            } else if (selectedAnswer === idx) {
              optionClass = 'border-primary bg-primary/5';
              indicatorClass = 'bg-primary border-primary';
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${optionClass}`}
              >
                <span className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${indicatorClass} ${showResult && idx === quiz.correctAnswer ? 'text-white' : ''} ${showResult && idx === selectedAnswer && !isCorrect ? 'text-white' : ''} ${!showResult && selectedAnswer === idx ? 'text-white' : ''}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-base font-medium text-slate-700">{option}</span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`px-6 py-4 border-t ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <span className="font-bold text-green-700">回答正确！</span>
              ) : (
                <span className="font-bold text-red-700">回答错误，正确答案是 {String.fromCharCode(65 + quiz.correctAnswer)}</span>
              )}
            </div>
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{quiz.explanation}</p>
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button onClick={prevQuiz} disabled={currentQuiz === 0} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-white disabled:opacity-50">
            上一题
          </button>
          <span className="text-sm text-slate-500">{currentQuiz + 1} / {quizzes.length}</span>
          {currentQuiz < quizzes.length - 1 ? (
            <button onClick={nextQuiz} disabled={!showResult} className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50">
              下一题
            </button>
          ) : (
            <button onClick={resetQuiz} className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
              重新测试
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState<'root' | 'family' | 'synonym' | 'quiz'>('root');
  const [showInsightPanel, setShowInsightPanel] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/vocab');
        if (!response.ok) throw new Error('Failed to connect to backend');
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
    setActiveTab('root');
    setShowInsightPanel(false);
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
    if (vocabList.length > 1) {
      setSelectedIndex((prev) => (prev + 1) % vocabList.length);
    }
    setReviewing(true);
    try {
      await fetch(`/api/vocab/${currentItem.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality })
      });
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setReviewing(false);
    }
  };

  const filteredList = vocabList.filter(v => v.word.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentItem = filteredList[selectedIndex] || filteredList[0];

  const masteredCount = vocabList.filter(v => v.status === 'mastered').length;
  const learningCount = vocabList.filter(v => v.status === 'learning' || v.status === 'new').length;
  const reviewingCount = vocabList.filter(v => v.status === 'reviewing').length;
  const todayDueCount = vocabList.filter(v => !v.next_review_at || new Date(v.next_review_at) <= new Date()).length;

  const exportToCsv = () => {
    if (vocabList.length === 0) return;
    const headers = ['id', 'word', 'phonetic', 'definition', 'image_url', 'difficulty', 'tags', 'status', 'next_review_at', 'examples'];
    const escapeCsv = (value: string | number | null | undefined) => {
      const stringValue = value === null || value === undefined ? '' : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    };
    const rows = vocabList.map(item => {
      const examples = (item.examples || []).map(ex => `${ex.en} || ${ex.cn}`).join(' | ');
      return [item.id, item.word, item.phonetic, item.definition, item.imageUrl || '', item.difficulty, (item.tags || []).join('|'), item.status, item.next_review_at, examples].map(escapeCsv).join(',');
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
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
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
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFollowReadState({ status: 'error', error: '当前浏览器不支持语音识别，请使用 Chrome 或 Edge。' });
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
        feedback: assessment?.feedback || (rating === 'perfect' ? '发音非常标准！' : '可以尝试放慢语速并注意重音。'),
        issues: assessment?.issues
      });
    };
    recognition.onerror = () => setFollowReadState({ status: 'error', error: '识别失败，请重试。' });
    recognition.onend = () => { if (!hasResult) setFollowReadState({ status: 'error', error: '未检测到语音输入。' }); };
    recognition.start();
  };

  const loadWordInsight = async () => {
    if (!currentItem?.word) return;
    setInsightLoading(true);
    setInsightError(null);
    try {
      const result = await getWordInsights(currentItem.word);
      setWordInsight(result);
      setShowInsightPanel(true);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Top Status Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="cursor-pointer hover:text-primary font-medium">IELTS</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-bold">闪卡</span>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <svg className="w-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${filteredList.length ? ((selectedIndex + 1) / filteredList.length) * 100 : 0}, 100`} strokeLinecap="round" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-700">{filteredList.length ? Math.round(((selectedIndex + 1) / filteredList.length) * 100) : 0}%</span>
                  </div>
                </div>
                <div className="text-xs">
                  <p className="text-slate-500">Card</p>
                  <p className="font-bold text-slate-700">{selectedIndex + 1} / {filteredList.length}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full border border-orange-200">
                <Flame size={16} className="text-orange-500" />
                <span className="text-sm font-bold text-orange-600">12天</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-slate-600">{todayDueCount}待复习</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg">
                  <TrendingUp size={12} className="text-green-500" />
                  <span className="text-green-700">{masteredCount}已掌握</span>
                </div>
              </div>

              <button onClick={exportToCsv} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Export CSV">
                <Download size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Word List */}
        <div className="w-72 bg-white border-r border-slate-200 hidden lg:block h-[calc(100vh-73px)] sticky top-[73px]">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="搜索单词..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">全部</button>
              <button className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">新词</button>
              <button className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">复习</button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-120px)]">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500 text-sm font-medium mb-2">{error}</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Database size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">暂无单词</p>
                <Link to="/settings" className="text-xs text-primary font-bold hover:underline mt-2 block">去导入</Link>
              </div>
            ) : (
              filteredList.map((item, idx) => {
                const isActive = currentItem?.word === item.word;
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`px-4 py-3 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative ${isActive ? 'bg-blue-50/50' : ''}`}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r"></div>}
                    <div className="flex justify-between items-center">
                      <h4 className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-slate-900'}`}>{item.word}</h4>
                      <div className="flex items-center gap-1">
                        {item.status === 'mastered' && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                        {item.status === 'reviewing' && <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate pr-4 mt-1">{item.definition}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center - Main Card Area */}
        <div className="flex-1 min-h-[calc(100vh-73px)] p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 size={48} className="animate-spin text-primary mb-4" />
              <p className="text-slate-500 font-medium">Loading...</p>
            </div>
          ) : !currentItem ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>没有找到单词</p>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-2xl mx-auto">
              {/* Word Card */}
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

              {/* Review Console */}
              <div className="mt-6 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => handleReview(1)} disabled={reviewing} className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-red-600 transition-all active:scale-95 disabled:opacity-50">
                      <X size={20} className="mb-2" />
                      <span className="font-bold text-sm">不认识</span>
                      <span className="text-[10px] opacity-60 mt-1">10分钟</span>
                    </button>
                    <button onClick={() => handleReview(2)} disabled={reviewing} className="flex flex-col items-center justify-center p-4 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 text-orange-600 transition-all active:scale-95 disabled:opacity-50">
                      <Minus size={20} className="mb-2" />
                      <span className="font-bold text-sm">困难</span>
                      <span className="text-[10px] opacity-60 mt-1">1小时</span>
                    </button>
                    <button onClick={() => handleReview(3)} disabled={reviewing} className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-600 transition-all active:scale-95 disabled:opacity-50">
                      <Check size={20} className="mb-2" />
                      <span className="font-bold text-sm">良好</span>
                      <span className="text-[10px] opacity-60 mt-1">6小时</span>
                    </button>
                    <button onClick={() => handleReview(5)} disabled={reviewing} className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50">
                      <Check size={20} className="mb-2" />
                      <span className="font-bold text-sm">简单</span>
                      <span className="text-[10px] opacity-80 mt-1">1天</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Insight Toggle */}
              <div className="mt-6 w-full max-w-2xl">
                <button onClick={loadWordInsight} disabled={insightLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-50 border border-primary/20 text-primary font-bold flex items-center justify-center gap-2 hover:from-primary/20 hover:to-purple-100 transition-all">
                  {insightLoading ? (<><Loader2 size={18} className="animate-spin" />AI 分析中...</>) : (<><Sparkles size={18} />AI 深度分析：词根记忆 + 同义词对比 + 随堂小测</>)}
                </button>

                {showInsightPanel && wordInsight && (
                  <div className="mt-4 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 border-b border-slate-200">
                      {[
                        { key: 'root', label: '词根故事', icon: '🎯' },
                        { key: 'family', label: '派生词族', icon: '👨‍👩‍👧‍👦' },
                        { key: 'synonym', label: '同义词', icon: '🔍' },
                        { key: 'quiz', label: '随堂小测', icon: '📝' }
                      ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`p-3 rounded-lg text-center transition-all ${activeTab === tab.key ? 'bg-white shadow text-primary font-bold' : 'text-slate-500 hover:bg-white/50'}`}>
                          <span className="text-lg block mb-1">{tab.icon}</span>
                          <span className="text-xs">{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4">
                      {activeTab === 'root' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white rounded-xl">
                            <h4 className="text-xl font-bold mb-1">{wordInsight.wordAnalysis?.word}</h4>
                            <p className="text-slate-300 text-sm">{wordInsight.wordAnalysis?.phonetic} · {wordInsight.wordAnalysis?.pos}</p>
                            <p className="text-yellow-300 font-medium mt-2">{wordInsight.wordAnalysis?.chineseMeaning}</p>
                          </div>
                          {wordInsight.wordRoot && (
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                <span className="font-mono font-bold text-lg text-orange-600">{wordInsight.wordRoot.root}</span>
                                <div>
                                  <p className="text-sm text-slate-700">{wordInsight.wordRoot.meaning}</p>
                                  <p className="text-xs text-slate-500 mt-1">{wordInsight.wordRoot.englishMeaning}</p>
                                </div>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <p className="text-sm font-bold text-orange-700 mb-2">💡 记忆故事</p>
                                <p className="text-sm text-slate-700">{wordInsight.wordRoot.memoryStory}</p>
                                <p className="text-xs text-slate-500 mt-2 italic">{wordInsight.wordRoot.englishMemoryStory}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'family' && (
                        <div className="grid grid-cols-1 gap-3">
                          {wordInsight.wordFormation?.map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-blue-600">{item.word}</span>
                                <span className="text-xs px-2 py-0.5 bg-slate-200 rounded">{item.pos}</span>
                              </div>
                              <p className="text-sm text-slate-600">{item.meaning}</p>
                              <p className="text-xs text-slate-400 mt-1">{item.englishMeaning}</p>
                              <p className="text-xs text-slate-500 italic mt-2">"{item.example}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'synonym' && (
                        <div className="space-y-3">
                          {wordInsight.synonyms?.map((syn, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-slate-800">{syn.word}</span>
                                <span className="text-xs text-slate-500">{syn.meaning}</span>
                              </div>
                              <div className="text-xs space-y-1">
                                <p><span className="text-green-600 font-medium">含义：</span>{syn.englishMeaning}</p>
                                <p><span className="text-blue-600 font-medium">用法：</span>{syn.englishUsage}</p>
                                <p><span className="text-orange-600 font-medium">区别：</span>{syn.englishDifference}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'quiz' && (
                        wordInsight.practiceQuiz && wordInsight.practiceQuiz.length > 0 ? (
                          <QuizSection quizzes={wordInsight.practiceQuiz} />
                        ) : (
                          <div className="p-8 text-center text-slate-500"><p>暂无练习题</p></div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vocabulary;

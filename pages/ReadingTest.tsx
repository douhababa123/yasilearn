import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

interface ReadingQuestion {
  id: number;
  questionNum: string;
  type: string;
  question: string;
  options?: string[];
}

interface ReadingPassage {
  id: number;
  passageNum: number;
  title: string;
  content: string;
  questions: ReadingQuestion[];
}

export const ReadingTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [currentPassage, setCurrentPassage] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes

  // Fetch reading data from API
  useEffect(() => {
    const fetchReadingData = async () => {
      if (!testId) return;

      try {
        const response = await fetch(`/api/reading/${testId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reading data');
        }
        const data = await response.json();
        setPassages(data);
      } catch (error) {
        console.error('Error fetching reading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadingData();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [loading, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToNextQuestion = () => {
    const currentPassageData = passages[currentPassage];
    if (!currentPassageData) return;

    const totalQuestions = currentPassageData.questions.length;
    const totalQuestionsAll = passages.reduce((acc, p) => acc + p.questions.length, 0);
    const currentQuestionNumber = passages.slice(0, currentPassage).reduce((acc, p) => acc + p.questions.length, 0) + currentQuestionIndex + 1;

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentPassage < passages.length - 1) {
      setCurrentPassage(currentPassage + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentPassage > 0) {
      setCurrentPassage(currentPassage - 1);
      const prevPassage = passages[currentPassage - 1];
      setCurrentQuestionIndex(prevPassage.questions.length - 1);
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    let total = 0;

    passages.forEach((passage) => {
      passage.questions.forEach((q) => {
        total++;
        if (answers[q.id]?.toLowerCase().trim() === q.options?.[0]?.toLowerCase().trim()) {
          correct++;
        }
      });
    });

    const score = Math.round((correct / total) * 9 * 10) / 10;

    navigate(`/mock-tests/${testId}/result`, {
      state: {
        section: 'reading',
        score,
        total,
        correct,
        answers,
        passages,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f6f6f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reading test...</p>
        </div>
      </div>
    );
  }

  if (passages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f6f6f8]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Reading Test Available</h2>
          <p className="text-slate-600 mb-6">
            This test doesn't have any reading passages. Please upload and parse a PDF with reading content first.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
          >
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  const currentPassageData = passages[currentPassage];
  const currentQuestion = currentPassageData?.questions[currentQuestionIndex];
  const totalQuestionsAll = passages.reduce((acc, p) => acc + p.questions.length, 0);
  const currentQuestionNumber = passages.slice(0, currentPassage).reduce((acc, p) => acc + p.questions.length, 0) + currentQuestionIndex + 1;
  const progress = (currentQuestionNumber / totalQuestionsAll) * 100;

  return (
    <div className="flex flex-col h-screen bg-[#f6f6f8] overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-white z-20 shrink-0">
        <div className="flex items-center gap-4">
          <Link to={`/mock-tests/${testId}`} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h1 className="text-lg font-bold tracking-tight text-slate-900">IELTS Academic Reading</h1>
          </div>
          <span className="h-6 w-px bg-gray-200 mx-2"></span>
          <span className="text-sm font-medium text-gray-500">Passage {currentPassage + 1}</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-green-50 px-4 py-1.5 rounded-full">
          <Clock size={18} className="text-green-600" />
          <span className="text-green-600 font-bold text-lg tabular-nums">{formatTime(timeLeft)}</span>
          <span className="text-xs text-green-600/70 font-medium ml-1">remaining</span>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Passage Content */}
        <div className="w-1/2 overflow-y-auto border-r border-slate-200 p-6 lg:p-8 bg-white">
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                Passage {currentPassage + 1}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{currentPassageData?.title}</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {currentPassageData?.content}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Questions */}
        <div className="w-1/2 overflow-y-auto bg-[#f6f6f8] p-6 lg:p-8">
          <div className="max-w-xl mx-auto flex flex-col gap-6">
            {/* Question Progress */}
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 text-xl font-bold leading-tight">
                Question {currentQuestionNumber} of {totalQuestionsAll}
              </h2>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                {currentQuestion?.type || 'Question'}
              </span>
            </div>

            {/* Question Content */}
            {currentQuestion && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                  <p className="text-lg font-medium text-slate-900 mb-4">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            answers[currentQuestion.id] === option
                              ? 'bg-blue-50 border-2 border-primary'
                              : 'bg-white border-2 border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={answers[currentQuestion.id] === option}
                            onChange={() => handleAnswerChange(currentQuestion.id, option)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="font-medium text-slate-700">
                            {String.fromCharCode(65 + idx)}. {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {!currentQuestion.options && (
                    <div>
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={goToPrevQuestion}
                disabled={currentPassage === 0 && currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-200 text-gray-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              {/* Question Navigator */}
              <div className="flex gap-1 flex-wrap max-w-xs justify-center">
                {passages.map((p, pIdx) =>
                  p.questions.map((q, qIdx) => {
                    const qNum = passages.slice(0, pIdx).reduce((acc, sec) => acc + sec.questions.length, 0) + qIdx + 1;
                    const isActive = pIdx === currentPassage && qIdx === currentQuestionIndex;
                    const isAnswered = answers[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentPassage(pIdx);
                          setCurrentQuestionIndex(qIdx);
                        }}
                        className={`w-8 h-8 rounded font-bold text-xs transition-all ${
                          isActive
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-1'
                            : isAnswered
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {qNum}
                      </button>
                    );
                  })
                )}
              </div>

              {currentQuestionNumber === totalQuestionsAll ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all"
                >
                  Submit
                  <CheckCircle size={20} />
                </button>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Progress */}
      <footer className="bg-white border-t border-slate-200 h-12 shrink-0 flex items-center px-6 gap-4 z-20">
        <div className="flex-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <span className="text-sm text-slate-500 font-medium">
          {currentQuestionNumber} / {totalQuestionsAll} questions
        </span>
      </footer>
    </div>
  );
};

export default ReadingTest;

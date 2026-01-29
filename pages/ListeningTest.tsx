import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Settings, HelpCircle, Play, Timer, ArrowLeft, ArrowRight, Building, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

interface ListeningQuestion {
  id: number;
  questionNum: string;
  type: string;
  question: string;
  options?: string[];
}

interface ListeningSection {
  id: number;
  section: number;
  questions: ListeningQuestion[];
  audio_path: string | null;
  audioTiming?: string;
}

export const ListeningTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<ListeningSection[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch listening data from API
  useEffect(() => {
    const fetchListeningData = async () => {
      if (!testId) return;

      try {
        const response = await fetch(`/api/listening/${testId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listening data');
        }
        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error('Error fetching listening data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListeningData();
  }, [testId]);

  // Timer countdown
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Auto-submit when time is up
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
    const currentSectionData = sections[currentSection];
    if (!currentSectionData) return;

    if (currentQuestionIndex < currentSectionData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSection = sections[currentSection - 1];
      setCurrentQuestionIndex(prevSection.questions.length - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correct = 0;
    let total = 0;

    sections.forEach((section) => {
      section.questions.forEach((q) => {
        total++;
        if (answers[q.id]?.toLowerCase().trim() === q.options?.[0]?.toLowerCase().trim()) {
          correct++;
        }
      });
    });

    const score = Math.round((correct / total) * 9 * 10) / 10;

    // Navigate to result page
    navigate(`/mock-tests/${testId}/result`, {
      state: {
        section: 'listening',
        score,
        total,
        correct,
        answers,
        sections,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f6f6f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading listening test...</p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f6f6f8]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Listening Test Available</h2>
          <p className="text-slate-600 mb-6">
            This test doesn't have any listening questions. Please upload and parse a PDF with listening content first.
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

  const currentSectionData = sections[currentSection];
  const currentQuestion = currentSectionData?.questions[currentQuestionIndex];
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const currentQuestionNumber = sections.slice(0, currentSection).reduce((acc, s) => acc + s.questions.length, 0) + currentQuestionIndex + 1;
  const progress = (currentQuestionNumber / totalQuestions) * 100;

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
            <h1 className="text-lg font-bold tracking-tight text-slate-900">IELTS Academic Listening</h1>
          </div>
          <span className="h-6 w-px bg-gray-200 mx-2"></span>
          <span className="text-sm font-medium text-gray-500">Section {currentSection + 1}</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full">
          <Timer size={18} className="text-primary" />
          <span className="text-primary font-bold text-lg tabular-nums">{formatTime(timeLeft)}</span>
          <span className="text-xs text-primary/70 font-medium ml-1">remaining</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            <Play size={18} fill="currentColor" />
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </header>

      {/* Audio Player Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-8 shrink-0 flex items-center gap-6 shadow-sm z-10">
        <div className={`flex items-center justify-center size-10 rounded-full ${isPlaying ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} shrink-0 transition-colors`}>
          <Volume2 size={24} fill="currentColor" />
        </div>
        <div className="flex flex-col flex-1 gap-1.5">
          <div className="flex justify-between items-end">
            <span className="text-xs font-semibold text-gray-700">Section {currentSection + 1} Audio</span>
            <span className="text-xs font-medium text-gray-500">{isPlaying ? 'Playing...' : 'Paused'}</span>
          </div>
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000`} style={{ width: isPlaying ? '100%' : '0%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f6f6f8] p-6 md:p-10 flex justify-center">
        <div className="w-full max-w-[960px] flex flex-col gap-6 pb-20">
          {/* Question Progress */}
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 text-2xl font-bold leading-tight">
              Question {currentQuestionNumber} of {totalQuestions}
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
              {currentQuestion?.type || 'Question'}
            </span>
          </div>

          {/* Question Content */}
          {currentQuestion && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">
                  {currentQuestion.question}
                </h3>
                {currentQuestion.options && (
                  <div className="mt-4 space-y-2">
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
                  <div className="mt-4">
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

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevQuestion}
              disabled={currentSection === 0 && currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-200 text-gray-600 font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <div className="flex gap-2">
              {sections.map((section, sIdx) =>
                section.questions.map((q, qIdx) => {
                  const qNum = sections.slice(0, sIdx).reduce((acc, sec) => acc + sec.questions.length, 0) + qIdx + 1;
                  const isActive = sIdx === currentSection && qIdx === currentQuestionIndex;
                  const isAnswered = answers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentSection(sIdx);
                        setCurrentQuestionIndex(qIdx);
                      }}
                      className={`w-10 h-10 rounded font-bold text-sm transition-all ${
                        isActive
                          ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
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
            {currentQuestionNumber === totalQuestions ? (
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
      </main>

      {/* Footer with Progress */}
      <footer className="bg-white border-t border-slate-200 h-16 shrink-0 flex items-center px-6 gap-4 z-20">
        <div className="flex-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <span className="text-sm text-slate-500 font-medium">
          {currentQuestionNumber} / {totalQuestions} questions
        </span>
      </footer>
    </div>
  );
};

export default ListeningTest;

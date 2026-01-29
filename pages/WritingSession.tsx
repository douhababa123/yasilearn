import React, { useState, useEffect } from 'react';
import { Lightbulb, Layout, Undo, Redo, Maximize, ArrowRight, Clock, Info, Quote, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { evaluateEssay } from '../services/ai';

interface WritingTask {
  type: 'Task1' | 'Task2';
  prompt: string;
  requirements: string[];
  wordCountTarget: number;
}

export const WritingSession = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [essayContent, setEssayContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<{ task1: WritingTask | null; task2: WritingTask | null }>({
    task1: null,
    task2: null,
  });
  const [currentTask, setCurrentTask] = useState<'task1' | 'task2'>('task2');

  // 倒计时逻辑：40分钟 = 2400秒
  const [timeLeft, setTimeLeft] = useState(40 * 60);

  // Fetch writing tasks from API
  useEffect(() => {
    const fetchWritingTasks = async () => {
      if (!testId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/writing/${testId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const writingData = data[0];
            setTasks({
              task1: writingData.task1_prompt ? JSON.parse(writingData.task1_prompt) : null,
              task2: writingData.task2_prompt ? JSON.parse(writingData.task2_prompt) : null,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching writing tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWritingTasks();
  }, [testId]);

  // Use default topic if no tasks from API
  const currentTopic = currentTask === 'task1' && tasks.task1
    ? tasks.task1.prompt
    : currentTask === 'task2' && tasks.task2
    ? tasks.task2.prompt
    : "Some people believe that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?";

  const wordCountTarget = currentTask === 'task1' && tasks.task1
    ? tasks.task1.wordCountTarget
    : currentTask === 'task2' && tasks.task2
    ? tasks.task2.wordCountTarget
    : currentTask === 'task1' ? 150 : 250;

  const wordCount = essayContent.trim().split(/\s+/).filter(w => w.length > 0 && w !== "").length;

  // 格式化时间 MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // 如果已经在分析中或时间归零，停止倒计时
    if (isAnalyzing || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isAnalyzing, timeLeft]);

  const handleSubmit = async () => {
    if (!essayContent.trim()) {
      alert("Please write something before submitting!");
      return;
    }

    setIsAnalyzing(true);
    try {
      // 调用 AI 服务层
      const result = await evaluateEssay(essayContent, currentTopic);

      // 分析完成后跳转到结果页，并通过 state 传递数据
      navigate('/writing/result', {
        state: {
          result,
          essayContent, // 把原文也传过去显示
          topic: currentTopic,
          submittedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      alert("Analysis failed. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f6f6f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading writing task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f6f6f8] overflow-hidden flex-col">
       {/* Overlay Loading State */}
       {isAnalyzing && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
            <Loader2 size={48} className="animate-spin mb-4 text-primary" />
            <h2 className="text-2xl font-bold">AI Examiner is grading your essay...</h2>
            <p className="text-slate-300 mt-2">Checking grammar, coherence, and task response.</p>
         </div>
       )}

       <header className="h-16 px-6 lg:px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link to={`/mock-tests/${testId}`} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Writing Task {currentTask === 'task1' ? '1' : '2'}: {currentTask === 'task1' ? 'Graph Description' : 'Essay'}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Topic: {currentTask === 'task1' ? 'Task 1' : 'Task 2'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Task Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentTask('task1')}
              disabled={!tasks.task1}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTask === 'task1'
                  ? 'bg-primary text-white'
                  : tasks.task1
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              Task 1
            </button>
            <button
              onClick={() => setCurrentTask('task2')}
              disabled={!tasks.task2}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTask === 'task2'
                  ? 'bg-primary text-white'
                  : tasks.task2
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
              }`}
            >
              Task 2
            </button>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isAnalyzing ? 'Analyzing...' : 'Submit for AI Review'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left: Sidebar Instructions */}
        <div className="w-full lg:w-5/12 h-full overflow-y-auto border-r border-slate-200 bg-white p-6 lg:p-10 scrollbar-thin">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                <Info size={16} className="text-primary" />
                Instructions
              </h3>
              <ul className="text-sm text-slate-600 space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                  You should spend about <strong>40 minutes</strong> on this task.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                  Write at least <strong>250 words</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                  Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                </li>
              </ul>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold uppercase tracking-wide mb-4">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                The Question
              </span>
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 relative shadow-sm">
                <Quote className="absolute top-6 left-6 text-slate-200 text-5xl transform -translate-x-2 -translate-y-2 pointer-events-none fill-current" />
                <p className="text-xl font-medium text-slate-800 leading-relaxed z-10 relative pl-4">
                   "{currentTopic}"
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Tools & Help</h4>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-primary rounded-lg group-hover:scale-110 transition-transform">
                      <Lightbulb size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Idea Bank</span>
                      <span className="text-[10px] text-slate-400">Get topic points</span>
                    </div>
                  </div>
                </button>
                 <button className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-slate-50 transition-all group bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-50 text-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Layout size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-700 group-hover:text-teal-600 transition-colors">Structure</span>
                      <span className="text-[10px] text-slate-400">Essay template</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col bg-slate-50/50 relative">
          <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
             <div className="flex items-center gap-6 lg:gap-10">
                <div className="flex items-center gap-3" title="Time Remaining">
                   <div className="relative w-5 h-5 flex items-center justify-center">
                     <span className="absolute w-full h-full rounded-full border-2 border-slate-200"></span>
                     <span className={`absolute w-full h-full rounded-full border-2 border-primary border-t-transparent ${timeLeft > 0 ? 'animate-spin' : ''}`}></span>
                   </div>
                   <div className="flex flex-col leading-none">
                     <span className={`font-mono text-xl font-bold tracking-wider ${timeLeft < 300 ? 'text-red-500' : 'text-slate-900'}`}>
                        {formatTime(timeLeft)}
                     </span>
                     <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Time Left</span>
                   </div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col leading-none">
                   <div className="flex items-baseline gap-1">
                     <span className="text-xl font-bold text-slate-900">{wordCount}</span>
                     <span className="text-xs font-medium text-slate-400">/ 250 words</span>
                   </div>
                   <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Count</span>
                </div>
             </div>
             
             <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md transition-all shadow-sm">
                  <Undo size={18} />
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white rounded-md transition-all shadow-sm">
                  <Redo size={18} />
                </button>
                <div className="w-px h-5 bg-slate-300 mx-1"></div>
                <button className="p-2 text-slate-500 hover:text-primary hover:bg-white rounded-md transition-all shadow-sm">
                   <Maximize size={18} />
                </button>
             </div>
          </div>

          <div className="flex-1 relative overflow-y-auto cursor-text">
            <textarea 
              className="w-full min-h-full p-8 lg:p-12 resize-none bg-transparent border-none focus:ring-0 text-lg leading-8 text-slate-800 placeholder:text-slate-300 outline-none font-medium font-sans" 
              placeholder="Start typing your response here... (Try writing a short essay to test the AI!)"
              autoFocus
              value={essayContent}
              onChange={(e) => setEssayContent(e.target.value)}
            ></textarea>
          </div>
          
          <div className="absolute bottom-4 right-6 text-xs text-slate-300 select-none pointer-events-none hidden lg:block">
            Type your essay and click submit to test the AI Analysis
          </div>
        </div>
      </div>
    </div>
  );
};
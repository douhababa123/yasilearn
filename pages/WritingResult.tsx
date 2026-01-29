import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  BookOpen, 
  Link as LinkIcon, 
  RefreshCw, 
  Eye, 
  BarChart2, 
  Bookmark,
  ArrowRight,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { AssessmentResult, FeedbackItem } from '../services/ai';

export const WritingResult = () => {
  const location = useLocation();
  const state = location.state as { result: AssessmentResult, essayContent: string, topic: string, submittedAt: string } | null;
  const [activeTab, setActiveTab] = useState<'original' | 'improved'>('original');

  // 如果没有数据（比如直接访问URL），重定向回练习页
  if (!state) {
    return <Navigate to="/writing" replace />;
  }

  const { result, essayContent, topic, submittedAt } = state;

  return (
    <div className="flex flex-col h-screen bg-[#f6f6f8] overflow-hidden">
      <header className="flex-none flex items-center justify-between border-b border-slate-200 bg-white px-10 py-3 z-10">
         <div className="flex items-center gap-4">
           <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
             <FileText size={20} />
           </div>
           <h2 className="text-slate-900 text-lg font-bold">IELTS Master</h2>
         </div>
         <div className="flex gap-8 items-center">
            <nav className="flex gap-6 text-sm font-medium">
               <Link to="/" className="text-slate-600 hover:text-primary cursor-pointer">Dashboard</Link>
               <span className="text-slate-900 border-b-2 border-primary pb-0.5">My Practice</span>
               <span className="text-slate-600 hover:text-primary cursor-pointer">Analysis</span>
            </nav>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-slate-100">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQGsDTSonjhC23BVSJrd5o3QhiguHWS-C4fGT6QRotMnI6fECh_9iytOcjjR3JNA_ggmzVXBP0AYO0-UYoFCJFgBaQfCxpJoAlkPg8UKSvi-LrtpbmBrx01pcnM0vsHSLgZuxWytIenHD3Or5PJeIHswqxdyOMAt1nlJ-wxR4jLMaEh6DMZZ9vWahPUQYLk6afyAbWXbZjj5riCGQ8fBKfJJoLPyjh9qLbs56VIpH7n7V_5Wz3jBpnrNaBYzerZ9pYxA-F-V7bmuM" alt="Profile" />
            </div>
         </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
         <div className="flex-none px-6 py-5 bg-[#f6f6f8]">
            <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center">
               <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-2xl font-bold text-slate-900 max-w-2xl truncate" title={topic}>Writing Task 2</h1>
                     <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary uppercase">AI Evaluated</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    Submitted on {new Date(submittedAt).toLocaleDateString()} • {result.wordCount} Words
                  </p>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  <Download size={18} />
                  Download PDF
               </button>
            </div>
         </div>

         <div className="flex-1 min-h-0 px-6 pb-6">
            <div className="max-w-[1600px] mx-auto w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
               
               {/* Essay Text Display with Tabs */}
               <div className="lg:col-span-4 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex gap-1">
                     <button 
                        onClick={() => setActiveTab('original')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'original' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                     >
                        <FileText size={16} /> Original
                     </button>
                     <button 
                         onClick={() => setActiveTab('improved')}
                         className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'improved' ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                     >
                        <Sparkles size={16} className={activeTab === 'improved' ? 'text-teal-500' : ''} /> Polished Version
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 leading-loose text-slate-800 font-light text-lg whitespace-pre-wrap">
                      {activeTab === 'original' ? (
                          essayContent
                      ) : (
                          <div className="animate-in fade-in duration-500">
                              <div className="mb-4 p-3 bg-teal-50 text-teal-800 text-sm rounded-lg border border-teal-100 flex gap-2">
                                  <Sparkles size={18} className="shrink-0 mt-0.5" />
                                  <p>Here is a Band 9.0 version of your essay. Notice the improved vocabulary and sentence structures.</p>
                              </div>
                              {result.improvedEssay}
                          </div>
                      )}
                  </div>
               </div>

               {/* Feedback Feed */}
               <div className="lg:col-span-4 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <MessageSquare size={18} className="text-slate-400" />
                           Detailed Analysis
                        </h3>
                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{result.feedback.length} Issues</span>
                     </div>
                     <div className="flex gap-2 overflow-x-auto pb-1">
                        <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium">All</button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-100 text-xs font-medium hover:bg-red-100">
                           <AlertCircle size={14} /> Grammar
                        </button>
                         <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 text-xs font-medium hover:bg-purple-100">
                           <BookOpen size={14} /> Vocabulary
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 text-xs font-medium hover:bg-orange-100">
                           <LinkIcon size={14} /> Coherence
                        </button>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-bold text-blue-800 mb-1">General Comment</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">{result.generalComment}</p>
                     </div>

                     {result.feedback.map((item: FeedbackItem, i: number) => (
                        <div key={i} className={`bg-white border-l-4 border-${item.color}-500 rounded-r-lg shadow-sm p-4 group hover:shadow-md transition-all`}>
                           <div className="flex justify-between items-start mb-2">
                              <span className={`bg-${item.color}-100 text-${item.color}-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase`}>{item.type}</span>
                              <Bookmark size={16} className="text-slate-300 hover:text-primary cursor-pointer" />
                           </div>
                           
                           <div className="mb-4 p-3 bg-red-50/50 rounded-lg border border-red-100/50">
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-1">Original</p>
                              <p className={`text-sm text-slate-600 line-through decoration-red-400 decoration-2`}>{item.originalText}</p>
                           </div>

                           <div className="mb-4 p-3 bg-green-50/50 rounded-lg border border-green-100/50">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-green-600 uppercase font-bold tracking-wide">Better</p>
                                <Sparkles size={10} className="text-green-500" />
                              </div>
                              <p className="text-base font-bold text-slate-800">{item.correctedText}</p>
                           </div>
                           
                           <div className="text-sm text-slate-600 space-y-2">
                              <p><span className="font-semibold text-slate-800">Why:</span> {item.explanation}</p>
                              <p className="text-slate-500 italic border-l-2 border-slate-200 pl-2">{item.chineseExplanation}</p>
                           </div>

                           {item.improvementTip && (
                               <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2">
                                   <Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                   <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Tip:</span> {item.improvementTip}</p>
                               </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>

               {/* Score & Actions */}
               <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Overall Band Score</h3>
                      <div className="relative size-32 flex items-center justify-center mb-4">
                         <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                             <circle cx="50" cy="50" r="45" fill="none" stroke="#11d4d4" strokeWidth="8" strokeDasharray={`${(result.overallScore / 9) * 283} 283`} strokeLinecap="round" />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold text-slate-800">{result.overallScore}</span>
                         </div>
                      </div>
                      <div className="text-center">
                         <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold mb-1">
                            {result.overallScore >= 7 ? "Excellent" : result.overallScore >= 6 ? "Good" : "Keep Practicing"}
                         </span>
                         <p className="text-xs text-slate-400">Target Score: 7.0</p>
                      </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 overflow-y-auto">
                     <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart2 size={20} className="text-primary" /> Detailed Breakdown
                     </h3>
                     <div className="space-y-6">
                        {[
                           { label: 'Task Response', score: result.breakdown.taskResponse, desc: 'Relevance and development of ideas.' },
                           { label: 'Lexical Resource', score: result.breakdown.lexicalResource, desc: 'Range and accuracy of vocabulary.' },
                           { label: 'Coherence & Cohesion', score: result.breakdown.coherenceCohesion, desc: 'Logical flow and linking words.' },
                           { label: 'Grammar Range', score: result.breakdown.grammar, desc: 'Sentence structures and errors.' },
                        ].map((s, i) => (
                           <div key={i}>
                              <div className="flex justify-between items-end mb-1">
                                 <span className="text-sm font-medium text-slate-700">{s.label}</span>
                                 <span className="text-sm font-bold text-slate-900">{s.score}</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(s.score / 9) * 100}%` }}></div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-col gap-3">
                     <Link to="/writing" className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-teal-400 text-white font-bold transition shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2">
                        <RefreshCw size={18} /> New Essay
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
};
